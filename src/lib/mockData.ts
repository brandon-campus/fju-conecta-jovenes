export type Role = 'asistente' | 'lider' | 'coordinador';

export interface Joven {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  direccion: string;
  whatsapp: string;
  redesSociales: string;
  fechaRegistro: string;
  totalAsistencias: number;
}

export interface Actividad {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  activa: boolean;
}

export interface Asistencia {
  jovenId: string;
  actividadId: string;
  fecha: string;
  hora: string;
}

export const mockJovenes: Joven[] = [
  { id: '1', nombre: 'Valentina', apellido: 'García', edad: 17, direccion: 'Av. Rivadavia 1200, CABA', whatsapp: '+54 11 2345-6789', redesSociales: '@vale_g / @valeg_tt', fechaRegistro: '2025-01-15', totalAsistencias: 12 },
  { id: '2', nombre: 'Matías', apellido: 'López', edad: 19, direccion: 'Calle San Martín 450, Quilmes', whatsapp: '+54 11 3456-7890', redesSociales: '@mati.lopez', fechaRegistro: '2025-02-03', totalAsistencias: 8 },
  { id: '3', nombre: 'Camila', apellido: 'Rodríguez', edad: 16, direccion: 'Belgrano 890, Morón', whatsapp: '+54 11 4567-8901', redesSociales: '@cami_rod', fechaRegistro: '2025-02-20', totalAsistencias: 15 },
  { id: '4', nombre: 'Tomás', apellido: 'Martínez', edad: 20, direccion: 'Mitre 320, Lanús', whatsapp: '+54 11 5678-9012', redesSociales: '@tomas_mtz', fechaRegistro: '2025-03-01', totalAsistencias: 3 },
  { id: '5', nombre: 'Lucía', apellido: 'Fernández', edad: 18, direccion: 'Av. Corrientes 2500, CABA', whatsapp: '+54 11 6789-0123', redesSociales: '@lu.fernandez / @lu_fer_tt', fechaRegistro: '2025-03-10', totalAsistencias: 1 },
  { id: '6', nombre: 'Santiago', apellido: 'Pérez', edad: 21, direccion: 'Calle Lavalle 780, Avellaneda', whatsapp: '+54 11 7890-1234', redesSociales: '@santi.perez', fechaRegistro: '2024-11-25', totalAsistencias: 22 },
  { id: '7', nombre: 'Martina', apellido: 'Gómez', edad: 15, direccion: 'Av. Santa Fe 1100, CABA', whatsapp: '+54 11 8901-2345', redesSociales: '@marti_gomez', fechaRegistro: '2025-01-28', totalAsistencias: 6 },
  { id: '8', nombre: 'Joaquín', apellido: 'Díaz', edad: 22, direccion: 'Calle Perón 340, Lomas de Zamora', whatsapp: '+54 11 9012-3456', redesSociales: '@joaco.diaz', fechaRegistro: '2024-12-15', totalAsistencias: 18 },
];

export const mockActividades: Actividad[] = [
  { id: 'a1', nombre: 'Fútbol', tipo: 'Deportes', descripcion: 'Entrenamiento de fútbol semanal', activa: true },
  { id: 'a2', nombre: 'Boxeo', tipo: 'Deportes', descripcion: 'Clases de boxeo y defensa personal', activa: true },
  { id: 'a3', nombre: 'Capacitación', tipo: 'Educación', descripcion: 'Talleres de formación y liderazgo', activa: true },
  { id: 'a4', nombre: 'Cultura', tipo: 'Arte', descripcion: 'Actividades culturales y artísticas', activa: true },
  { id: 'a5', nombre: 'Help', tipo: 'Social', descripcion: 'Acciones sociales y comunitarias', activa: true },
  { id: 'a6', nombre: 'Medios', tipo: 'Comunicación', descripcion: 'Producción audiovisual y redes', activa: true },
  { id: 'a7', nombre: 'FJUNI', tipo: 'Infantil', descripcion: 'Programa para niños menores de 12', activa: false },
  { id: 'a8', nombre: 'Unifuerzas', tipo: 'Especial', descripcion: 'Eventos especiales de unificación', activa: false },
];

export const mockAsistenciasHoy: Asistencia[] = [
  { jovenId: '1', actividadId: 'a1', fecha: new Date().toISOString().split('T')[0], hora: '10:15' },
  { jovenId: '3', actividadId: 'a1', fecha: new Date().toISOString().split('T')[0], hora: '10:20' },
  { jovenId: '6', actividadId: 'a1', fecha: new Date().toISOString().split('T')[0], hora: '10:30' },
  { jovenId: '8', actividadId: 'a1', fecha: new Date().toISOString().split('T')[0], hora: '10:35' },
];

export const mockHistorialAsistencia = [
  { actividad: 'Fútbol', fecha: '2025-03-15' },
  { actividad: 'Capacitación', fecha: '2025-03-10' },
  { actividad: 'Help', fecha: '2025-03-05' },
  { actividad: 'Fútbol', fecha: '2025-02-28' },
  { actividad: 'Cultura', fecha: '2025-02-20' },
  { actividad: 'Boxeo', fecha: '2025-02-15' },
];
