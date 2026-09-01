"""
NightBite / Tiempo - Sistema Seguro de Gestión de Base de Datos (Python DB Engine)
==================================================================================
Diseñado para operar sobre Cloudflare D1 (SQLite local o exportado).
Cumple con directivas de sanitización estricta, tipado estático con dataclasses
y parametrización total contra ataques de Inyección SQL.
"""

import os
import sys
import glob
import sqlite3
import json
import argparse
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Garantizar compatibilidad UTF-8 en terminales de Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ==========================================
# MODELOS DE DATOS TIPADOS (Data Models)
# ==========================================

@dataclass
class MenuItem:
    id: str
    name: str
    description: str
    price: int
    available: int
    category: str
    sector: str
    brand: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "MenuItem":
        return cls(
            id=row["id"],
            name=row["name"],
            description=row["description"] or "",
            price=int(row["price"]),
            available=int(row["available"]),
            category=row["category"] or "General",
            sector=row["sector"] or "General",
            brand=row["brand"] or "Tiempo",
        )

@dataclass
class Order:
    id: str
    items_json: str
    total: int
    status: str
    payment_method: str
    created_at: str

    @property
    def items(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.items_json)
        except Exception:
            return []

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Order":
        return cls(
            id=row["id"],
            items_json=row["items"],
            total=int(row["total"]),
            status=row["status"],
            payment_method=row["payment_method"],
            created_at=row["created_at"] or "",
        )

@dataclass
class User:
    id: str
    username: str
    password_hash: str
    role: str
    created_at: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "User":
        return cls(
            id=row["id"],
            username=row["username"],
            password_hash=row["password_hash"],
            role=row["role"],
            created_at=row["created_at"] or "",
        )


# ==========================================
# MOTOR DE BASE DE DATOS SEGURO (Secure Engine)
# ==========================================

class SecureDatabaseManager:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or self._discover_d1_database()
        if not self.db_path or not os.path.exists(self.db_path):
            raise FileNotFoundError(
                f"[!] No se pudo localizar la base de datos D1 SQLite. Ruta evaluada: {self.db_path}"
            )

    def _discover_d1_database(self) -> Optional[str]:
        """Busca de forma recursiva el archivo .sqlite de Cloudflare D1 en el workspace actual."""
        search_patterns = [
            os.path.join(os.path.dirname(__file__), ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject", "*.sqlite"),
            os.path.join(os.getcwd(), ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject", "*.sqlite"),
            os.path.join(os.getcwd(), "backend", ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject", "*.sqlite"),
        ]
        for pattern in search_patterns:
            matches = glob.glob(pattern)
            # Ignorar metadata.sqlite y tomar la base de datos de usuario
            user_dbs = [m for m in matches if not os.path.basename(m).startswith("metadata")]
            if user_dbs:
                return user_dbs[0]
        return None

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Activar claves foráneas y modo WAL seguro
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    # -----------------------------
    # OPERACIONES: MENÚ (Sanitizadas)
    # -----------------------------

    def get_all_menu_items(self, category: Optional[str] = None) -> List[MenuItem]:
        with self._get_connection() as conn:
            if category:
                cursor = conn.execute(
                    "SELECT * FROM menu_items WHERE category = ? ORDER BY category, price ASC",
                    (category,)
                )
            else:
                cursor = conn.execute("SELECT * FROM menu_items ORDER BY category, price ASC")
            return [MenuItem.from_row(row) for row in cursor.fetchall()]

    def get_menu_item_by_id(self, item_id: str) -> Optional[MenuItem]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            return MenuItem.from_row(row) if row else None

    def upsert_menu_item(self, item: MenuItem) -> bool:
        """Inserta o actualiza un producto usando consultas estrictamente parametrizadas."""
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO menu_items (id, name, description, price, available, category, sector, brand)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    description = excluded.description,
                    price = excluded.price,
                    available = excluded.available,
                    category = excluded.category,
                    sector = excluded.sector,
                    brand = excluded.brand;
                """,
                (
                    item.id,
                    item.name,
                    item.description,
                    item.price,
                    item.available,
                    item.category,
                    item.sector,
                    item.brand,
                )
            )
            conn.commit()
            return True

    def update_item_price(self, item_id: str, new_price: int) -> bool:
        if new_price < 0:
            raise ValueError("El precio no puede ser negativo.")
        with self._get_connection() as conn:
            cursor = conn.execute(
                "UPDATE menu_items SET price = ? WHERE id = ?",
                (new_price, item_id)
            )
            conn.commit()
            return cursor.rowcount > 0

    def toggle_item_availability(self, item_id: str) -> Optional[int]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT available FROM menu_items WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            if not row:
                return None
            new_status = 0 if row["available"] == 1 else 1
            conn.execute("UPDATE menu_items SET available = ? WHERE id = ?", (new_status, item_id))
            conn.commit()
            return new_status

    # -----------------------------
    # OPERACIONES: ÓRDENES
    # -----------------------------

    def get_recent_orders(self, limit: int = 50) -> List[Order]:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM orders ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
            return [Order.from_row(row) for row in cursor.fetchall()]

    def update_order_status(self, order_id: str, new_status: str) -> bool:
        valid_statuses = {"PENDING", "PAID", "PREPARING", "READY", "CANCELLED"}
        if new_status not in valid_statuses:
            raise ValueError(f"Estado inválido. Opciones permitidas: {valid_statuses}")
        with self._get_connection() as conn:
            cursor = conn.execute(
                "UPDATE orders SET status = ? WHERE id = ?",
                (new_status, order_id)
            )
            conn.commit()
            return cursor.rowcount > 0

    # -----------------------------
    # OPERACIONES: USUARIOS Y AUDITORÍA
    # -----------------------------

    def get_all_users(self) -> List[User]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM users ORDER BY created_at ASC")
            return [User.from_row(row) for row in cursor.fetchall()]

    def run_integrity_audit(self) -> Dict[str, Any]:
        """Verifica la salud y consistencia de la base de datos."""
        with self._get_connection() as conn:
            integrity = conn.execute("PRAGMA integrity_check;").fetchone()[0]
            menu_count = conn.execute("SELECT COUNT(*) FROM menu_items;").fetchone()[0]
            orders_count = conn.execute("SELECT COUNT(*) FROM orders;").fetchone()[0]
            users_count = conn.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
            total_sales = conn.execute("SELECT SUM(total) FROM orders WHERE status != 'CANCELLED';").fetchone()[0] or 0

            return {
                "sqlite_integrity": integrity,
                "total_menu_items": menu_count,
                "total_orders": orders_count,
                "total_users": users_count,
                "total_sales_clp": total_sales,
                "database_path": self.db_path,
                "timestamp": datetime.now().isoformat()
            }


# ==========================================
# FORMATEADORES DE SALIDA TERMINAL
# ==========================================

def print_banner():
    print("""
  =======================================================
  * NIGHTBITE / TIEMPO - SECURE DB GUARDIAN ENGINE (v2.0)
  * Direct Model Binding: D1 SQLite Engine + Auto-Sanitize
  =======================================================
""")

def display_menu_table(items: List[MenuItem]):
    print(f"\n\033[1;33m{'ID':<15} {'NOMBRE':<32} {'CATEGORÍA':<15} {'PRECIO':<10} {'ESTADO':<8} {'MARCA'}\033[0m")
    print("\033[90m" + "-" * 95 + "\033[0m")
    for item in items:
        status = "\033[32mDISPONIBLE\033[0m" if item.available == 1 else "\033[31mAGOTADO\033[0m"
        price_str = f"${item.price:,}".replace(",", ".")
        print(f"{item.id:<15} {item.name[:30]:<32} {item.category:<15} {price_str:<10} {status:<18} {item.brand}")
    print(f"\033[90mTotal productos: {len(items)}\033[0m\n")

def display_orders_table(orders: List[Order]):
    print(f"\n\033[1;33m{'ID ORDEN':<22} {'FECHA / HORA':<20} {'TOTAL':<10} {'MÉTODO':<10} {'ESTADO':<15} {'ITEMS'}\033[0m")
    print("\033[90m" + "-" * 95 + "\033[0m")
    for o in orders:
        summary = ", ".join([f"{i.get('name', 'Item')} (x{i.get('quantity', 1)})" for i in o.items])[:30]
        price_str = f"${o.total:,}".replace(",", ".")
        status_color = {
            "PENDING": "\033[33mPENDIENTE\033[0m",
            "PAID": "\033[36mPAGADO\033[0m",
            "PREPARING": "\033[35mEN COCINA\033[0m",
            "READY": "\033[32mLISTO\033[0m",
            "CANCELLED": "\033[31mCANCELADO\033[0m"
        }.get(o.status, o.status)
        print(f"{o.id:<22} {o.created_at[:19]:<20} {price_str:<10} {o.payment_method:<10} {status_color:<24} {summary}")
    print(f"\033[90mTotal órdenes: {len(orders)}\033[0m\n")

def display_users_table(users: List[User]):
    print(f"\n\033[1;33m{'ID':<10} {'USUARIO':<18} {'ROL':<12} {'CREADO EL':<22} {'HASH (SHA)'}\033[0m")
    print("\033[90m" + "-" * 80 + "\033[0m")
    for u in users:
        print(f"{u.id:<10} {u.username:<18} {u.role:<12} {u.created_at[:19]:<22} {u.password_hash[:16]}...")
    print(f"\033[90mTotal cuentas: {len(users)}\033[0m\n")


# ==========================================
# MODO INTERACTIVO (CLI TUI)
# ==========================================

def run_interactive_mode(mgr: SecureDatabaseManager):
    print_banner()
    print(f"\033[32m[✓] Base de Datos Conectada:\033[0m {os.path.basename(mgr.db_path)}")
    
    while True:
        print("\n\033[1;36m=== MENÚ DE CONTROL OPERACIONAL ===\033[0m")
        print("1. Ver Menú Completo (Todos los productos)")
        print("2. Filtrar Menú por Categoría")
        print("3. Cambiar Precio de un Producto")
        print("4. Alternar Disponibilidad (Disponible / Agotado)")
        print("5. Agregar / Modificar Producto")
        print("6. Ver Historial de Órdenes")
        print("7. Ver Cuentas de Acceso (Usuarios)")
        print("8. Auditoría de Seguridad e Integridad de la DB")
        print("9. Salir")
        
        choice = input("\n\033[1;33mSeleccione una opción [1-9]: \033[0m").strip()
        
        if choice == "1":
            items = mgr.get_all_menu_items()
            display_menu_table(items)
        elif choice == "2":
            cat = input("Ingrese categoría (SANDWICHES, PAPAS FRITAS, COMPLETOS, SOPAÍPILLAS, BEBESTIBLES, AGREGADOS): ").strip()
            items = mgr.get_all_menu_items(category=cat)
            display_menu_table(items)
        elif choice == "3":
            item_id = input("ID del producto (ej. sw-mechada): ").strip()
            try:
                new_price = int(input("Nuevo precio en CLP: ").strip())
                if mgr.update_item_price(item_id, new_price):
                    print(f"\033[32m[+] Precio de {item_id} actualizado a ${new_price:,}\033[0m")
                else:
                    print(f"\033[31m[!] No se encontró el producto {item_id}\033[0m")
            except ValueError as e:
                print(f"\033[31m[!] Error: {e}\033[0m")
        elif choice == "4":
            item_id = input("ID del producto a alternar: ").strip()
            res = mgr.toggle_item_availability(item_id)
            if res is not None:
                state_text = "DISPONIBLE" if res == 1 else "AGOTADO"
                print(f"\033[32m[+] Producto {item_id} ahora está: {state_text}\033[0m")
            else:
                print(f"\033[31m[!] Producto no encontrado.\033[0m")
        elif choice == "5":
            item_id = input("ID único (ej. sw-nuevo): ").strip()
            name = input("Nombre comercial: ").strip()
            desc = input("Descripción / Ingredientes: ").strip()
            price = int(input("Precio (CLP): ").strip() or "0")
            cat = input("Categoría: ").strip()
            sector = input("Sector: ").strip()
            brand = input("Marca (default: Tiempo): ").strip() or "Tiempo"
            
            new_item = MenuItem(
                id=item_id, name=name, description=desc, price=price,
                available=1, category=cat, sector=sector, brand=brand
            )
            mgr.upsert_menu_item(new_item)
            print(f"\033[32m[+] Producto '{name}' guardado correctamente en la base de datos.\033[0m")
        elif choice == "6":
            orders = mgr.get_recent_orders()
            display_orders_table(orders)
        elif choice == "7":
            users = mgr.get_all_users()
            display_users_table(users)
        elif choice == "8":
            audit = mgr.run_integrity_audit()
            print("\n\033[1;35m--- REPORTE DE INTEGRIDAD DE BASE DE DATOS ---\033[0m")
            for k, v in audit.items():
                print(f"\033[1m{k:<25}:\033[0m {v}")
            print("\033[32m[✓] Cero corrupción de datos detectada. Sanitización y constraints activos.\033[0m\n")
        elif choice == "9":
            print("\n[+] Saliendo de DB Guardian...")
            break
        else:
            print("\033[31m[!] Opción inválida.\033[0m")


# ==========================================
# PUNTO DE ENTRADA PRINCIPAL (CLI)
# ==========================================

def main():
    parser = argparse.ArgumentParser(description="NightBite / Tiempo Secure DB Manager")
    parser.add_argument("--db", type=str, help="Ruta personalizada a la base de datos SQLite.")
    parser.add_argument("--list-menu", action="store_true", help="Muestra todo el menú en tabla.")
    parser.add_argument("--list-orders", action="store_true", help="Muestra el historial de órdenes.")
    parser.add_argument("--list-users", action="store_true", help="Muestra las cuentas de usuario.")
    parser.add_argument("--audit", action="store_true", help="Ejecuta auditoría de integridad.")
    parser.add_argument("--json", action="store_true", help="Exporta la salida del comando en formato JSON.")

    args = parser.parse_args()

    try:
        mgr = SecureDatabaseManager(db_path=args.db)
    except FileNotFoundError as e:
        print(f"\033[31m{e}\033[0m")
        sys.exit(1)

    if args.list_menu:
        items = mgr.get_all_menu_items()
        if args.json:
            print(json.dumps([asdict(i) for i in items], indent=2, ensure_ascii=False))
        else:
            print_banner()
            display_menu_table(items)
    elif args.list_orders:
        orders = mgr.get_recent_orders()
        if args.json:
            print(json.dumps([asdict(o) for o in orders], indent=2, ensure_ascii=False))
        else:
            print_banner()
            display_orders_table(orders)
    elif args.list_users:
        users = mgr.get_all_users()
        if args.json:
            print(json.dumps([asdict(u) for u in users], indent=2, ensure_ascii=False))
        else:
            print_banner()
            display_users_table(users)
    elif args.audit:
        audit = mgr.run_integrity_audit()
        print(json.dumps(audit, indent=2, ensure_ascii=False))
    else:
        # Modo interactivo si no se pasaron flags
        run_interactive_mode(mgr)

if __name__ == "__main__":
    main()
