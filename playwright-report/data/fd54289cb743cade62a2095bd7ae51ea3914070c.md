# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- text: UR
- heading "Bienvenido de vuelta" [level=1]
- paragraph: Inicia sesión en tu cuenta de URContent
- heading "Iniciar Sesión" [level=2]
- paragraph: Accede a tu cuenta
- button "Mostrar Cuentas de Prueba"
- text: Email
- textbox "Email": creator@urcontent.com
- text: Contraseña
- textbox "••••••••": creator123
- button:
  - img
- link "¿Olvidaste tu contraseña?":
  - /url: /forgot-password
- button "Iniciar Sesión"
- text: o
- button "Explorar como Invitado"
- text: ¿No tienes cuenta?
- link "Regístrate aquí":
  - /url: /registro
- text: 🧪 Sistema de autenticación de prueba activo. Usa las cuentas de prueba de arriba.
- heading "🚨 Emergency Access" [level=3]
- paragraph: "If authentication is not working, you can access the app directly:"
- button "🎨 Creator Dashboard (Emergency Access)"
- button "🏢 Business Dashboard (Emergency Access)"
- button "👑 Admin Dashboard (Emergency Access)"
- paragraph: "Note: Some features may not work properly in emergency mode."
```