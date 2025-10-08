import { supabase } from "../lib/supabaseClient";

export const addFavorite = async (symbol, companyName) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Please log in to save favorites');
  }

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      symbol: symbol,
      company_name: companyName
    });

  if (error) throw error;
  return true;
};

export const removeFavorite = async (symbol) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Please log in');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('symbol', symbol);

  if (error) throw error;
  return true;
};

export const checkIsFavorited = async (symbol) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('symbol', symbol)
    .single();

  return !!data;
};

export const getFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
};