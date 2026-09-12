import { Modal } from '../ui/Modal';
import { useUI } from '../../context/UIProvider';
import { businessConfig } from '../../config/business';
import { legal, fillLegalTokens } from '../../data/legal';

/**
 * Privacy Policy / Terms.
 *
 * The wording lives in src/data/legal.js and is editable from the
 * admin panel (Content → Legal). Until it has been reviewed, a notice
 * to the site owner sits at the top — switch it off in the CMS once
 * the copy is final.
 */
export function LegalModal() {
  const { legalDoc, closeLegal } = useUI();
  const doc = legalDoc ? legal[legalDoc] : null;
  const fill = (text) => fillLegalTokens(text, businessConfig);

  return (
    <Modal
      open={Boolean(doc)}
      onClose={closeLegal}
      size="lg"
      title={doc?.title}
      description={doc?.updated}
    >
      {doc && (
        <div>
          {legal.showDraftNotice !== false && (
            <div className="mb-5 rounded-2xl border border-gold-300/40 bg-gold-200/20 p-4">
              <p className="text-fluid-xs leading-relaxed text-charcoal-600">
                <strong className="font-bold text-emerald-900">Note for the site owner:</strong>{' '}
                this is placeholder wording describing how the site currently behaves. Have it
                reviewed by a legal professional, then replace it under{' '}
                <strong className="font-semibold text-emerald-900">Content → Legal</strong> in the
                admin panel and switch this notice off.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {(doc.sections || []).map((section, index) => (
              <section key={section.heading || index}>
                <h3 className="text-fluid-h4 font-semibold">{section.heading}</h3>
                <p className="mt-1.5 whitespace-pre-line text-fluid-sm leading-relaxed text-charcoal-500">
                  {fill(section.body)}
                </p>
              </section>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default LegalModal;
