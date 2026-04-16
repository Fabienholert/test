import DamageAutocomplete from "./DamageAutocomplete";
import DateField from "./DateField";
import InputField from "./InputField";
import SelectField from "./SelectField";

export default function SectionCapture({ data, onChange, validationErrors }) {
  return (
    <div className="section-card border-l-4 border-capture bg-blue-50">
      <h2 className="section-title text-capture border-b-capture">
        Section B : Fiche de Saisie Réception
      </h2>

      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-3">
          Champs Obligatoires (Saisie Libre)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="OR #"
            name="orNumber"
            value={data.orNumber}
            onChange={onChange}
            required
            placeholder="Numéro OR"
            error={validationErrors.orNumber}
          />
          <InputField
            label="N°DISS"
            name="dissNumber"
            value={data.dissNumber}
            onChange={onChange}
            required
            placeholder="Numéro DISS"
            error={validationErrors.dissNumber}
          />
          <InputField
            label="VIN"
            name="vin"
            value={data.vin}
            onChange={onChange}
            required
            placeholder="Numéro VIN"
            error={validationErrors.vin}
          />
          <InputField
            label="Modèle"
            name="model"
            value={data.model}
            onChange={onChange}
            required
            placeholder="Modèle du véhicule"
            error={validationErrors.model}
          />
          <InputField
            label="KM"
            name="km"
            value={data.km}
            onChange={onChange}
            required
            placeholder="Kilométrage"
            error={validationErrors.km}
          />
          <InputField
            label="Technicien"
            name="technicien"
            value={data.technicien}
            onChange={onChange}
            required
            placeholder="Nom du technicien"
            error={validationErrors.technicien}
          />
          <InputField
            label="Pointage Atelier"
            name="pointageAtelier"
            value={data.pointageAtelier}
            onChange={onChange}
            required
            placeholder="Pointage atelier"
            error={validationErrors.pointageAtelier}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé Dommage <span className="text-red-500">*</span>
            </label>
            <DamageAutocomplete
              value={data.damageLabel || ""}
              onInput={(value) => {
                onChange({
                  target: { name: "damageLabel", value },
                });
              }}
              onSelect={(suggestion) => {
                onChange({
                  target: {
                    name: "codeDommage",
                    value: suggestion.code,
                  },
                });
                onChange({
                  target: {
                    name: "damageLabel",
                    value: suggestion.libelle,
                  },
                });
              }}
            />
            {validationErrors.codeDommage && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.codeDommage}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Dommage
            </label>
            <input
              type="text"
              value={data.codeDommage || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              placeholder="Auto-rempli"
            />
          </div>
          <InputField
            label="Code Avarie"
            name="codeAvarie"
            value={data.codeAvarie}
            onChange={onChange}
            required
            placeholder="Code avarie"
            error={validationErrors.codeAvarie}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-3">Questions Obligatoires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="DISS ouvert"
            name="dissOpen"
            value={data.dissOpen}
            onChange={onChange}
            options={[
              { value: "Oui", label: "Oui" },
              { value: "Non", label: "Non" },
            ]}
            required
            error={validationErrors.dissOpen}
          />
          <SelectField
            label="Protocole en ligne"
            name="protocole"
            value={data.protocole}
            onChange={onChange}
            options={[
              { value: "Oui", label: "Oui" },
              { value: "Non", label: "Non" },
            ]}
            required
            error={validationErrors.protocole}
          />
          <SelectField
            label="PPSO"
            name="ppso"
            value={data.ppso}
            onChange={onChange}
            options={[
              { value: "Oui", label: "Oui" },
              { value: "Non", label: "Non" },
            ]}
            required
            error={validationErrors.ppso}
          />
          <InputField
            label="Fiche pédagogique (N° ou 'Non')"
            name="fichePedagogique"
            value={data.fichePedagogique}
            onChange={onChange}
            required
            placeholder="N° ou 'Non'"
            error={validationErrors.fichePedagogique}
          />
          <InputField
            label="TPI (N° ou 'Non')"
            name="tpi"
            value={data.tpi}
            onChange={onChange}
            required
            placeholder="N° ou 'Non'"
            error={validationErrors.tpi}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-3">Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField
            label="Date du Diag"
            name="dateDiag"
            value={data.dateDiag}
            onChange={onChange}
            required
            error={validationErrors.dateDiag}
          />
          <DateField
            label="Sortie Promise"
            name="sortiepromise"
            value={data.sortiepromise}
            onChange={onChange}
            required
            error={validationErrors.sortiepromise}
          />
        </div>
      </div>
    </div>
  );
}
