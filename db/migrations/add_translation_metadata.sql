BEGIN;

-- Sauvegarde temporaire des données existantes
CREATE TABLE vocabulary_backup AS SELECT * FROM vocabulary;

-- Création de la fonction de validation
CREATE OR REPLACE FUNCTION validate_translations()
RETURNS trigger AS $$
BEGIN
    IF NOT (
        SELECT bool_and(
            (value ? 'text') AND
            (value ? 'context') AND
            (value ? 'tags') AND
            (value ? 'lists') AND
            jsonb_typeof(value->'tags') = 'array' AND
            jsonb_typeof(value->'lists') = 'array'
        )
        FROM jsonb_array_elements(NEW.translations)
    ) THEN
        RAISE EXCEPTION 'Invalid translation structure';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Renommer french en translations et convertir en jsonb
ALTER TABLE vocabulary 
    ALTER COLUMN french TYPE jsonb USING 
        jsonb_build_array(
            jsonb_build_object(
                'text', french,
                'context', '',
                'tags', COALESCE(to_jsonb(tags), '[]'::jsonb),
                'lists', COALESCE(to_jsonb(lists), '[]'::jsonb)
            )
        );

ALTER TABLE vocabulary RENAME COLUMN french TO translations;

-- Suppression des anciennes colonnes
ALTER TABLE vocabulary 
    DROP COLUMN IF EXISTS tags,
    DROP COLUMN IF EXISTS lists;

-- Contrainte de base pour vérifier que c'est un array
ALTER TABLE vocabulary
    ADD CONSTRAINT translations_type_check CHECK (jsonb_typeof(translations) = 'array');

-- Création du trigger
CREATE TRIGGER translations_validation
    BEFORE INSERT OR UPDATE ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION validate_translations();

-- Suppression de la table de backup
DROP TABLE vocabulary_backup;

COMMIT;

