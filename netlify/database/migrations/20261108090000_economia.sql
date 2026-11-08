-- Economia del joc «Agència Digital» validada al servidor (una sola moneda: els € de l'agència).
-- Llibre comptable només d'afegir: els saldos es poden reconstruir sumant els moviments.

-- Jugadors de cada classe. El professor valida qui forma part de la classe (evita comptes duplicats).
CREATE TABLE jugadors (
  classe      TEXT NOT NULL,
  pid         TEXT NOT NULL,             -- identificador públic (derivat de l'identificador secret)
  id_hash     TEXT NOT NULL,             -- sha256 de l'identificador secret del dispositiu
  nom         TEXT NOT NULL DEFAULT '',
  agencia     TEXT NOT NULL DEFAULT '',
  aprovat     BOOLEAN NOT NULL DEFAULT FALSE,
  bloquejat   BOOLEAN NOT NULL DEFAULT FALSE,
  creat_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classe, pid)
);

-- Saldo actual de cada jugador (memòria cau del llibre comptable; s'actualitza a la mateixa transacció)
CREATE TABLE saldos (
  classe      TEXT NOT NULL,
  pid         TEXT NOT NULL,
  saldo       BIGINT NOT NULL DEFAULT 0,
  actualitzat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classe, pid),
  FOREIGN KEY (classe, pid) REFERENCES jugadors (classe, pid)
);

-- Llibre comptable dels jugadors
CREATE TABLE moviments (
  id          BIGSERIAL PRIMARY KEY,
  classe      TEXT NOT NULL,
  pid         TEXT NOT NULL,
  idem        TEXT NOT NULL,             -- clau d'idempotència enviada pel joc (una operació = un moviment)
  tipus       TEXT NOT NULL,             -- inici, capitol, encarrec, projecte, web, botiguer, mercat, despesa, reinici, premi, altre...
  ref         TEXT NOT NULL DEFAULT '',  -- capítol, encàrrec, projecte, concurs...
  brut        BIGINT NOT NULL,           -- import abans d'impostos (negatiu = despesa)
  impost      BIGINT NOT NULL DEFAULT 0, -- retenció que va a la guardiola
  net         BIGINT NOT NULL,           -- import que rep o paga el jugador
  saldo_final BIGINT NOT NULL,
  detall      JSONB NOT NULL DEFAULT '{}'::jsonb,
  creat_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classe, pid, idem),
  FOREIGN KEY (classe, pid) REFERENCES jugadors (classe, pid)
);
CREATE INDEX moviments_jugador ON moviments (classe, pid, creat_at DESC);
CREATE INDEX moviments_ref ON moviments (classe, pid, tipus, ref);

-- Operacions rebutjades (per detectar intents de manipulació)
CREATE TABLE rebutjats (
  id          BIGSERIAL PRIMARY KEY,
  classe      TEXT NOT NULL,
  pid         TEXT NOT NULL,
  idem        TEXT NOT NULL,
  tipus       TEXT NOT NULL,
  ref         TEXT NOT NULL DEFAULT '',
  import_demanat BIGINT NOT NULL,
  motiu       TEXT NOT NULL,
  creat_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classe, pid, idem)
);

-- Guardiola comuna de cada classe i el seu llibre comptable
CREATE TABLE guardioles (
  classe      TEXT PRIMARY KEY,
  saldo       BIGINT NOT NULL DEFAULT 0,
  actualitzat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE guardiola_moviments (
  id          BIGSERIAL PRIMARY KEY,
  classe      TEXT NOT NULL,
  tipus       TEXT NOT NULL,             -- impost, premi, ajust
  import      BIGINT NOT NULL,           -- positiu = entra a la guardiola
  pid         TEXT,
  moviment_id BIGINT REFERENCES moviments (id),
  ref         TEXT NOT NULL DEFAULT '',
  saldo_final BIGINT NOT NULL,
  creat_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX guardiola_classe ON guardiola_moviments (classe, creat_at DESC);

-- Configuració editable des del panell del professor ('*' = valor per defecte per a totes les classes)
CREATE TABLE config (
  classe      TEXT NOT NULL,
  clau        TEXT NOT NULL,
  valor       JSONB NOT NULL,
  actualitzat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classe, clau)
);

-- Registre de les accions administratives
CREATE TABLE admin_log (
  id          BIGSERIAL PRIMARY KEY,
  classe      TEXT NOT NULL,
  accio       TEXT NOT NULL,
  detall      JSONB NOT NULL DEFAULT '{}'::jsonb,
  creat_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Els llibres comptables i el registre no es poden modificar ni esborrar
CREATE FUNCTION nomes_afegir() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'La taula % és un registre només d''afegir: no es pot modificar ni esborrar', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER moviments_nomes_afegir BEFORE UPDATE OR DELETE ON moviments FOR EACH ROW EXECUTE FUNCTION nomes_afegir();
CREATE TRIGGER guardiola_nomes_afegir BEFORE UPDATE OR DELETE ON guardiola_moviments FOR EACH ROW EXECUTE FUNCTION nomes_afegir();
CREATE TRIGGER admin_log_nomes_afegir BEFORE UPDATE OR DELETE ON admin_log FOR EACH ROW EXECUTE FUNCTION nomes_afegir();
