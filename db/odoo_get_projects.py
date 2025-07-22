
import json
import sys
import xmlrpc.client

# Uso: python odoo_get_projects.py <url> <db> <username> <password>

def get_projects(url, db, username, password):
    try:
        common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
        uid = common.authenticate(db, username, password, {})
        if not uid:
            print('ERROR: Autenticación fallida', file=sys.stderr)
            return
        models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
        empleados = models.execute_kw(db, uid, password, 'hr.employee', 'search_read', [[['user_id', '=', uid]]], {'fields': ['id'], 'limit': 1})
        if not empleados:
            print('ERROR: Empleado no encontrado', file=sys.stderr)
            return
        emp_id = empleados[0]['id']
        proyectos = models.execute_kw(db, uid, password, 'hr.attendance', 'get_employee_all_project', [emp_id])
        print(json.dumps(proyectos, ensure_ascii=False))
    except Exception as e:
        print(f'ERROR: {e}', file=sys.stderr)

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print('Uso: python odoo_get_projects.py <url> <db> <username> <password>')
        sys.exit(1)
    url, db, username, password = sys.argv[1:5]
    get_projects(url, db, username, password)
