-- Vérifier la structure de la table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vocabulary';

-- Vérifier que le trigger existe
SELECT tgname 
FROM pg_trigger 
WHERE tgrelid = 'vocabulary'::regclass;

-- Vérifier un exemple de données
SELECT id, translations 
FROM vocabulary 
LIMIT 1;