SELECT id, translations 
FROM vocabulary 
WHERE jsonb_array_length(translations) > 0;