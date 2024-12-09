const { data, error } = await supabase
  .from('recettes')
  .insert([/* vos données ici */]);

if (error) {
  console.error('Erreur lors de l\'insertion:', error);
  setSaveError(error); // Assurez-vous que saveError est mis à jour avec l'erreur
} 