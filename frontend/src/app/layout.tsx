import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Detailing Pro | Estética y Cuidado Automotor Premium",
  description: "Reservá tu turno de detailing online. Lavado premium, pulido de pintura, sellador cerámico y limpieza de interiores de nivel premium para tu vehículo.",
  keywords: ["detailing automotor", "lavado premium", "pulido de autos", "tratamiento ceramico", "limpieza interior auto", "turnos detailing online"],
  authors: [{ name: "Detailing Pro Team" }],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a0a0c%22 /><text y=%22.75em%22 x=%22.18em%22 font-size=%2260%22 font-family=%22sans-serif%22 font-weight=%22bold%22 fill=%22%23c5a880%22>D</text></svg>" />
      </head>
      <body className="bg-mesh min-h-screen text-dark-text selection:bg-brand-blue selection:text-white flex flex-col justify-between">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 glass border-b border-dark-border/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-xl font-bold font-display bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  DETAILING<span className="text-white">PRO</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 uppercase tracking-widest">
                  Studio
                </span>
              </a>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-muted">
              <a href="/#servicios" className="hover:text-white transition-colors">Servicios</a>
              <a href="/#galeria" className="hover:text-white transition-colors">Antes y Después</a>
              <a href="/#opiniones" className="hover:text-white transition-colors">Opiniones</a>
              <a href="/#contacto" className="hover:text-white transition-colors">Ubicación y Contacto</a>
            </nav>

            <div className="flex items-center gap-4">
              <a 
                href="/admin" 
                className="text-xs text-dark-muted hover:text-white px-3 py-1.5 rounded-lg border border-dark-border hover:bg-dark-card transition-all"
                id="btn-admin-panel"
              >
                Panel Admin
              </a>
              <a 
                href="/reservar" 
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-blue text-zinc-950 hover:bg-white hover:text-black transition-all"
                id="btn-nav-reserve"
              >
                Reservar Turno
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-dark-bg/80 border-t border-dark-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <span className="text-lg font-bold font-display bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent">
                  DETAILING<span className="text-white">PRO</span>
                </span>
                <p className="text-sm text-dark-muted leading-relaxed">
                  Estética automotor de nivel premium. Nos enfocamos en los detalles más minuciosos para devolver el brillo y la protección original a tu vehículo.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Enlaces</h4>
                <ul className="space-y-2 text-sm text-dark-muted">
                  <li><a href="/#servicios" className="hover:text-white transition-colors">Nuestros Servicios</a></li>
                  <li><a href="/#galeria" className="hover:text-white transition-colors">Trabajos Realizados</a></li>
                  <li><a href="/#opiniones" className="hover:text-white transition-colors">Opiniones de Clientes</a></li>
                  <li><a href="/reservar" className="hover:text-white transition-colors">Reserva Online</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Horarios de Atención</h4>
                <ul className="space-y-2 text-sm text-dark-muted">
                  <li>Lunes a Viernes</li>
                  <li className="text-white font-medium">09:00 hs a 18:00 hs</li>
                  <li>Sábados</li>
                  <li className="text-white font-medium">09:00 hs a 13:00 hs</li>
                  <li>Domingos y Feriados: Cerrado</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Contacto</h4>
                <ul className="space-y-2 text-sm text-dark-muted">
                  <li>Av. del Libertador 4800, Palermo</li>
                  <li>+54 9 11 2233-4455</li>
                  <li>info@detailingpro.com</li>
                  <li className="pt-2 flex gap-4 text-xs font-semibold">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">Instagram</a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">Facebook</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-dark-border/50 text-center text-xs text-dark-muted">
              <p>&copy; {new Date().getFullYear()} Detailing Pro. Todos los derechos reservados. Diseñado bajo estándares de máxima calidad.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
