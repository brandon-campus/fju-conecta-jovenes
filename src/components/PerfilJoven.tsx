import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Phone, Calendar as CalendarIcon, HeartHandshake, FileText, Loader2 } from 'lucide-react';

type Joven = { 
  id: string; 
  nombre: string; 
  apellido: string; 
  edad: number; 
  whatsapp?: string; 
  es_visitante?: boolean;
};

type Seguimiento = {
  id: string;
  nota: string;
  created_at: string;
  autor_id: string;
  perfiles: { nombre: string; apellido: string } | null;
};

interface PerfilJovenProps {
  joven: Joven | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
}

const PerfilJoven = ({ joven, isOpen, onOpenChange, userId }: PerfilJovenProps) => {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingNota, setSendingNota] = useState(false);
  const [reqAttention, setReqAttention] = useState(false);

  useEffect(() => {
    if (isOpen && joven) {
      cargarSeguimientos();
    }
  }, [isOpen, joven]);

  const cargarSeguimientos = async () => {
    if (!joven) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('seguimientos')
      .select(`
        id, nota, created_at, autor_id,
        perfiles (nombre, apellido)
      `)
      .eq('joven_id', joven.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setSeguimientos(data as unknown as Seguimiento[]);
    }
    setLoading(false);
  };

  const guardarNota = async () => {
    if (!joven || !userId || !nuevaNota.trim()) return;
    setSendingNota(true);
    
    const { error } = await supabase.from('seguimientos').insert({
      joven_id: joven.id,
      autor_id: userId,
      nota: nuevaNota.trim()
    });

    setSendingNota(false);
    
    if (error) {
      toast.error('Error al guardar nota');
      return;
    }
    
    toast.success('Nota de seguimiento guardada');
    setNuevaNota('');
    cargarSeguimientos();
  };

  const solicitarAtencion = async () => {
    if (!joven || !userId) return;
    setReqAttention(true);
    
    const { error } = await supabase.from('solicitudes_atencion').insert({
      joven_id: joven.id,
      solicitante_id: userId,
      motivo: 'Solicitud general requerida desde perfil',
      estado: 'pendiente'
    });

    setReqAttention(false);

    if (error) {
      toast.error('Error al solicitar atención');
      return;
    }

    toast.success('Se ha enviado la solicitud de atención pastoral');
  };

  if (!joven) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-auto sm:max-h-[90vh] sm:max-w-md w-full overflow-y-auto rounded-t-xl sm:rounded-xl">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl">
            {joven.nombre} {joven.apellido}
            {joven.es_visitante && (
              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                Visitante
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center gap-1"><CalendarIcon size={14} /> {joven.edad} años</span>
            {joven.whatsapp && (
              <a href={`https://wa.me/${joven.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full gap-2 justify-center" onClick={solicitarAtencion} disabled={reqAttention}>
              {reqAttention ? <Loader2 className="animate-spin" size={16} /> : <HeartHandshake size={16} />}
              Pedidos de oración
            </Button>
            {joven.whatsapp && (
              <Button onClick={() => window.open(`https://wa.me/${joven.whatsapp}`, '_blank')} className="w-full gap-2 justify-center bg-green-600 hover:bg-green-700 text-white">
                <Phone size={16} /> Contactar
              </Button>
            )}
          </div>

          {/* Seguimientos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
              <FileText size={16} />
              Historial y Seguimiento
            </h3>

            <div className="flex gap-2">
              <Input 
                placeholder="Añade una nota de seguimiento..." 
                value={nuevaNota}
                onChange={e => setNuevaNota(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarNota()}
                className="flex-1"
              />
              <Button onClick={guardarNota} disabled={!nuevaNota.trim() || sendingNota}>
                {sendingNota ? <Loader2 className="animate-spin" size={16} /> : 'Guardar'}
              </Button>
            </div>

            <div className="space-y-3 mt-4 max-h-[40vh] overflow-y-auto pr-2">
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : seguimientos.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No hay notas de seguimiento aún.</p>
              ) : (
                seguimientos.map(seg => (
                  <div key={seg.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p className="text-foreground">{seg.nota}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{seg.perfiles ? `${seg.perfiles.nombre} ${seg.perfiles.apellido}` : 'Usuario'}</span>
                      <span>{new Date(seg.created_at).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PerfilJoven;
