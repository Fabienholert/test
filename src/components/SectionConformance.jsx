import { differenceInDays, isAfter, parseISO, startOfDay } from "date-fns";
import DateField from "./DateField";
import SelectField from "./SelectField";

export default function SectionConformance({
  data,
  onChange,
  validationErrors,
}) {
  const handleValidation = () => {
    const errors = {};
    const today = startOfDay(new Date());

    // Validation réclamation client
    if (!data.reclamation) {
      errors.reclamation = "La réclamation client est requise";
    } else if (data.reclamation === "Non") {
      errors.reclamation = 'BLOCAGE: Réclamation doit être "Oui"';
    }

    // Validation signature dossier
    if (!data.signature) {
      errors.signature = "La signature dossier est requise";
    } else if (data.signature === "Non") {
      errors.signature = 'BLOCAGE: Signature dossier doit être "Oui"';
    }

    // Validation date d'entrée
    if (!data.dateEntree) {
      errors.dateEntree = "La date d'entrée véhicule est requise";
    } else {
      const entryDate = parseISO(data.dateEntree);
      const daysDiff = differenceInDays(today, entryDate);
      if (daysDiff > 30) {
        errors.dateEntree = `BLOCAGE: Date d'entrée a ${daysDiff} jours (max 30)`;
      }
    }

    // Validation date d'impression
    if (!data.dateImpression) {
      errors.dateImpression = "La date d'impression OR est requise";
    } else {
      if (
        data.dateEntree &&
        isAfter(parseISO(data.dateImpression), parseISO(data.dateEntree))
      ) {
        errors.dateImpression =
          "BLOCAGE: Date d'impression ne peut pas être après la date d'entrée";
      }
    }

    return errors;
  };

  const errors = handleValidation();
  const isCompliant = Object.keys(errors).length === 0;

  return (
    <div className="section-card border-l-4 border-compliance bg-orange-50">
      <h2 className="section-title text-compliance border-b-compliance">
        Section A : Conformité OR (Blocage)
      </h2>

      {!isCompliant && (
        <div className="alert-error">
          <strong>⚠️ Validation Conformité en Erreur</strong>
          <ul className="mt-2 list-disc pl-5">
            {Object.values(errors).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {isCompliant && (
        <div className="alert-success">
          <strong>✓ Conformité Validée</strong>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Réclamation client"
          name="reclamation"
          value={data.reclamation}
          onChange={onChange}
          options={[
            { value: "Oui", label: "Oui" },
            { value: "Non", label: "Non" },
          ]}
          required
          error={errors.reclamation}
        />

        <SelectField
          label="Signature dossier"
          name="signature"
          value={data.signature}
          onChange={onChange}
          options={[
            { value: "Oui", label: "Oui" },
            { value: "Non", label: "Non" },
          ]}
          required
          error={errors.signature}
        />

        <DateField
          label="Date d'entrée véhicule"
          name="dateEntree"
          value={data.dateEntree}
          onChange={onChange}
          required
          error={errors.dateEntree}
        />

        <DateField
          label="Date d'impression OR"
          name="dateImpression"
          value={data.dateImpression}
          onChange={onChange}
          required
          error={errors.dateImpression}
        />
      </div>

      <div className="mt-4 p-3 bg-white rounded border border-orange-200">
        <p className="text-sm text-gray-600">
          <strong>Status de Conformité:</strong>{" "}
          <span
            className={
              isCompliant
                ? "text-validation font-bold"
                : "text-red-600 font-bold"
            }
          >
            {isCompliant ? "✓ CONFORME" : "✗ NON CONFORME"}
          </span>
        </p>
      </div>
    </div>
  );
}
