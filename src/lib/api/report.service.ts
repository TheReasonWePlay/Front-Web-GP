import { API_CONFIG } from "./config";

export async function generateMonthlyReport(year: number, month: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/report/monthly/pdf?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Erreur lors de la génération du rapport");
      }
  
      // Récupère le PDF en blob
      const blob = await response.blob();
  
      // Création du lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
  
      link.download = `rapport_mensuel_${year}_${month}.pdf`;
      link.click();
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur:", err);
      throw err;
    }
  }
  