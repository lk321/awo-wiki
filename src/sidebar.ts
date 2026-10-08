// The shrine board: one tablet per section (styles/shrine.css hangs each one's kami on its summary, in this order).
const group = (label: string, directory: string, collapsed = true) => ({ label, collapsed, items: [{ autogenerate: { directory } }] });

export const sidebar = [
  { label: 'Portada', link: '/' },
  group('Mundos', 'mundos', false),
  group('Bestiario', 'bestiario'),
  group('Jefes principales', 'jefes'),
  group('Clases y combate', 'clases'),
  group('Objetos', 'objetos'),
  group('Economía y servicios', 'economia'),
  group('Progresión', 'progresion'),
  group('Interfaz y controles', 'interfaz'),
  group('Arte', 'arte'),
  group('Técnico', 'tecnico'),
];
