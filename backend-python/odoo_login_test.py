import xmlrpc.client

# Configuración de conexión a Odoo
url = 'https://registro.sinerkia-dev.com/'
db = 'registro'
username = 'sinerkiaid@gmail.com'
password = '10bf062c32411281c204cdaae28b9f06e54d2d55'  # API Key nueva

# Crear proxies para los servicios XML-RPC
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

# Probar conexión y autenticación con manejo de errores detallado
try:
    version = common.version()
    print('Versión de Odoo:', version)
except Exception as e:
    print('No se pudo conectar con el servidor Odoo. Error de conexión:', e)
    exit(1)

# Autenticación: obtener el UID del usuario
try:
    uid = common.authenticate(db, username, password, {})
    print('Respuesta bruta de Odoo (common.authenticate):', repr(uid), '| Tipo:', type(uid))
    if uid:
        # Ejemplo: buscar partners cuyo nombre contenga 'foo'
        partners = models.execute_kw(db, uid, password, 'res.partner', 'name_search', ['foo'], {'limit': 10})
        print('Partners encontrados:', partners)
    else:
        print('Error de autenticación. Las credenciales fueron rechazadas por Odoo.')
except Exception as e:
    print('Excepción durante la autenticación (no es un error de conexión):', e)
