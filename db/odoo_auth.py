


import sys
import xmlrpc.client

API_KEY = '10bf062c32411281c204cdaae28b9f06e54d2d55'  # API Key fija


def odoo_authenticate(url: str, db: str, username: str, password: str):
    try:
        common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
        version = common.version()
        print('Versión de Odoo:', version)
    except Exception as e:
        print('No se pudo conectar con el servidor Odoo. Error:', e)
        return None

    try:
        uid = common.authenticate(db, username, password, {})
        print('UID:', uid)
        if not uid:
            print('Error de autenticación. Credenciales incorrectas o sin permisos.')
        return uid
    except Exception as e:
        print('Error durante la autenticación:', e)
        return None

# Entry point para ejecución como script
if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Uso: python odoo_auth.py <url> <db> <username> <password>")
        sys.exit(1)
    url = sys.argv[1]
    db = sys.argv[2]
    username = sys.argv[3]
    password = sys.argv[4]
    print(f"Parámetros recibidos:\n  url: {url}\n  db: {db}\n  username: {username}\n  password: {password}")
    uid = odoo_authenticate(url, db, username, password)
    print(uid if uid is not None else "None")

