import { useSiteSettings } from '../context/SettingsContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { trackWhatsAppExpertClick } from '../api';

export default function WaButton() {
  const { settings } = useSiteSettings();
  if (!settings.whatsappPulseButton) return null;
  const href = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessageTemplate);
  const disabled = href === '#';

  return (
    <a
      className="wa-btn"
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        trackWhatsAppExpertClick().catch(() => {});
      }}
    >
      💬 Chat with an Expert
    </a>
  );
}
