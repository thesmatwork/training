import xmlrpc.client

class OdooAPI:
    def __init__(self, url, db, username, password):
        self.url = url
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self.models = None
        self._connect()

    def _connect(self):
        """Authenticate and prepare RPC objects"""
        try:
            common = xmlrpc.client.ServerProxy(f"{self.url}/xmlrpc/2/common")
            self.uid = common.authenticate(self.db, self.username, self.password, {})

            if not self.uid:
                raise Exception("Authentication failed")

            self.models = xmlrpc.client.ServerProxy(f"{self.url}/xmlrpc/2/object")
        except Exception as e:
            raise Exception(f"Failed to connect to Odoo: {e}")

    def authenticate(self, login, password):
        """Authenticate a user with email & password (like login screen)"""
        common = xmlrpc.client.ServerProxy(f"{self.url}/xmlrpc/2/common")
        uid = common.authenticate(self.db, login, password, {})
        return uid

    def call_method(self, model, method, args=None, kwargs=None):
        """Call an Odoo model method via RPC"""
        try:
            if args is None:
                args = []
            if kwargs is None:
                kwargs = {}
            return self.models.execute_kw(self.db, self.uid, self.password, model, method, args, kwargs)
        except Exception as e:
            raise Exception(f"Odoo RPC Error: {e}")
