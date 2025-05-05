export const summarizeMedications = (medicineList) => {
    return medicineList
      .filter(med => med.active)
      .map(med => {
        const parts = [`${med.name}`];
        if (med.dosageGuide) parts.push(`복용법: ${med.dosageGuide}`);
        if (med.warning) parts.push(`주의사항: ${med.warning}`);
        return "- " + parts.join(", ");
      })
      .join("\n");
  };
  