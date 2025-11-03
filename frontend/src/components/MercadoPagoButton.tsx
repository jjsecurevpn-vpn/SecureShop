import React, { useEffect, useRef, memo } from "react";
import { mercadoPagoService } from "../services/mercadopago.service";

interface MercadoPagoButtonProps {
  onSubmitRef: React.MutableRefObject<() => Promise<string>>;
}

const CONTAINER_ID = 'mp-wallet-container-unique';

/**
 * Componente placeholder que NO renderiza nada.
 * El botón real está en el body, manejado por el servicio singleton.
 * Este componente solo se encarga de inicializar el servicio.
 */
const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = memo(({ onSubmitRef }) => {
  const initRef = useRef(false);

  console.log(`[MercadoPagoButton] Render (should only appear once)`);

  useEffect(() => {
    console.log(`[MercadoPagoButton] useEffect inicialización`);
    
    if (initRef.current) {
      console.log('[MercadoPagoButton] Ya inicializado, saliendo');
      return;
    }

    initRef.current = true;

    const init = async () => {
      try {
        console.log('[MercadoPagoButton] Iniciando setup del servicio...');
        
        // El contenedor ya está creado en el constructor del servicio
        await mercadoPagoService.initialize();
        
        if (!mercadoPagoService.isButtonCreated()) {
          console.log('[MercadoPagoButton] Creando botón en contenedor del body...');
          await mercadoPagoService.createButton(CONTAINER_ID, () => onSubmitRef.current());
        } else {
          console.log('[MercadoPagoButton] Botón ya existe, actualizando callback');
          mercadoPagoService.updateCallback(() => onSubmitRef.current());
        }
        
        console.log('[MercadoPagoButton] ✅ Setup completado');
      } catch (error) {
        console.error('[MercadoPagoButton] ❌ Error durante setup:', error);
      }
    };

    init();

    return () => {
      console.log('[MercadoPagoButton] Cleanup (desmontando)');
    };
  }, []); // SOLO una vez

  // Este componente no renderiza nada - el botón está en el body
  return null;
}, () => true); // Nunca re-renderizar

MercadoPagoButton.displayName = 'MercadoPagoButton';

export default MercadoPagoButton;