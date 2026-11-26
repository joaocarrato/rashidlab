-- Drive Lab: combos e fluxogramas de oki da Kimberly.
-- Rode DEPOIS de 2026-11-25_1_multi_personagem.sql (precisa da tabela "mains" e da coluna "main").
-- Cole no SQL Editor do Supabase e execute. Pode rodar de novo sem duplicar nada:
-- cada combo/fluxograma tem um id fixo por usuário e o que já existe é pulado.
-- Vale para todo usuário cadastrado no site (auth.users); a Kimberly entra na lista dele.
--
-- Notação: ">" liga um golpe no outro, "~" é continuação (target combo ou seguimento do 236K),
-- j. = no ar, KK/PP = versão OD (2 barras de Drive), (PC) = punish counter.
-- "+47F" no título = vantagem em frames no fim do combo (tempo até o oponente poder agir).
--
-- Tudo fica dentro de um único bloco "do": o SQL Editor do Supabase grava cada comando
-- separado, então tabelas temporárias entre comandos sumiriam. Num bloco só, ou entra tudo
-- ou nada (se der erro no meio, nada fica pela metade).

do $mig$
declare
  v_user record;
  v_flow record;
  v_combo record;
  r text;
begin

if to_regclass('public.mains') is null then
  raise exception 'Rode antes a migration 2026-11-25_1_multi_personagem.sql';
end if;

drop table if exists pg_temp.kim_combos;
drop table if exists pg_temp.kim_flows;

create temp table kim_combos (
  k text primary key, ord int, title text, sit text, notation text, dmg int, cost text, notes text
);

insert into kim_combos (k, ord, title, sit, notation, dmg, cost, notes) values
-- ===== Execução (meio da tela) =====
('bnb-2lp', 1, '2LP > 2LP > 236LP (+3F)', 'Neutro/abertura',
 '2LP > 2LP > 236LP', 1053, 'Sem barra',
 'Confirmação leve. Termina +3F: sem tempo de setup, segue a pressão direto.'),
('bnb-2lp-tc', 2, '2LP > target combo (+49F)', 'Neutro/abertura',
 '2LP > LP ~ MP ~ HP ~ HK', 1262, 'Sem barra',
 'Termina +49F: tempo de sobra para oki ou para plantar bomba.'),
('bnb-2mp-arc', 3, '2MP > MP~HP > Sprint Arc Step (+30F)', 'Neutro/abertura',
 '2MP > MP ~ HP > 236K ~ Arc Step ~ K', 2021, 'Sem barra',
 'Mais dano que o final 236K~MK, mas menos vantagem (+30F).'),
('bnb-2mp-mk', 4, '2MP > MP~HP > 236K~MK (+47F)', 'Neutro/abertura',
 '2MP > MP ~ HP > 236K ~ MK', 1832, 'Sem barra',
 'BnB principal. +47F: perto do canto dá para plantar 22MP e ainda ficar +3F.'),
('bnb-4hk', 5, '4HK > 2LP > 236LP (+3F)', 'Neutro/abertura',
 '4HK > 2LP > 236LP', 1448, 'Sem barra',
 'Termina +3F: pressão direto, sem setup.'),
('bnb-hp-air', 6, 'HP > 236HP > j.236P (+22F)', 'Neutro/abertura',
 'HP > 236HP > j.236P', 2322, 'Sem barra',
 'Termina +22F: dá para meaty, mas não para plantar bomba.'),
('bnb-hp-od', 7, 'HP > 236HP > OD aéreo > 236LP (+35F)', 'Neutro/abertura',
 'HP > 236HP > j.236PP > 236K ~ LK > 236LP', 2835, '2 barras de Drive (+3 de Super com SA3)',
 'Termina +35F. Dá para fechar com SA3 depois do 236LP. Perto do canto, troque o 236LP por 22HP para plantar bomba (+11F).'),
('bnb-hk', 8, 'HK > MP~HP > 236K~MK (+47F)', 'Neutro/abertura',
 'HK > MP ~ HP > 236K ~ MK', 1962, 'Sem barra',
 'Termina +47F.'),

-- ===== Canto / perto do canto =====
('canto-214lk', 10, 'Perto do canto: 2MP > 236K~MK > 214LK (+21F)', 'Canto',
 '2MP > MP ~ HP > 236K ~ MK > 214LK', 2426, 'Sem barra',
 'Mais dano que parar no 236K~MK, mas cai de +47F para +21F.'),
('canto-od-arc', 11, 'Perto do canto: OD Sprint Arc Step > 236LP (+36F)', 'Canto',
 '2MP > MP ~ HP > 236KK ~ Arc Step ~ K > 236K ~ LK > 236LP', 2669, '2 barras de Drive',
 'Termina +36F.'),
('canto-4hk-214hk', 12, 'Canto: 4HK > 2LP > 214HK (+21F)', 'Canto',
 '4HK > 2LP > 214HK', 1682, 'Sem barra',
 'Versão de canto do 4HK > 2LP: troca o 236LP (+3F) por 214HK (+21F).'),

-- ===== Super Art =====
('sa1-od-arc', 15, 'Perto do canto: OD Sprint Arc Step > SA1', 'Super Art',
 '2MP > MP ~ HP > 236KK ~ Arc Step ~ K > 236K ~ LK > SA1', 3225, '2 barras de Drive + 1 de Super',
 'Para fechar o round.'),
('sa1-hp-od', 16, 'HP > 236HP > OD aéreo > SA1', 'Super Art',
 'HP > 236HP > j.236PP > 236K ~ LK > SA1', 3530, '2 barras de Drive + 1 de Super',
 'Para fechar o round.'),
('sa3-drc-drc', 17, 'MK > DRC > DRC > SA3 (dano máximo)', 'Super Art',
 'MK > DRC > 2HP > 236K ~ P > 2MP > 2MP > MP > DRC > 2HP > 236K ~ P > 2MP > 2MP > MP ~ HP > 236LP > SA3', 4575,
 '6 barras de Drive + 3 de Super',
 'Dois Drive Rush cancel: só com a barra de Drive cheia. Deixa você em burnout se não matar.'),

-- ===== Drive Rush =====
('drc-2mk', 20, 'MK > DRC > 2MK > MP~HP (+47F)', 'Drive Rush',
 'MK > DRC > 2MK > 2MP > MP ~ HP > 236K ~ MK', 1978, '3 barras de Drive',
 'Termina +47F.'),
('drc-2hp', 21, 'MK > DRC > 2HP > 236K~P (+47F)', 'Drive Rush',
 'MK > DRC > 2HP > 236K ~ P > 2MP > 2MP > MP ~ HP > 236K ~ MK', 2240, '3 barras de Drive',
 'Termina +47F. Mais dano que a rota com 2MK.'),
('dr-4hk', 22, 'DR > 4HK > MP~HP (+47F)', 'Drive Rush',
 'DR > 4HK > MP ~ HP > 236K ~ MK', 1755, '1 barra de Drive',
 'Termina +47F.'),
('dr-hk-od', 23, 'DR > HK > HP > OD aéreo (+35F)', 'Drive Rush',
 'DR > HK > HP > 236HP > j.236PP > 236K ~ LK > 236LP', 3096, '3 barras de Drive',
 'Termina +35F.'),
('dr-mp', 24, 'DR > MP > 2MP > MP~HP (+47F)', 'Drive Rush',
 'DR > MP > 2MP > MP ~ HP > 236K ~ MK', 2156, '1 barra de Drive',
 'Termina +47F.'),
('dr-2mk-od', 25, 'DR > 2MK > HP > OD aéreo (+35F)', 'Drive Rush',
 'DR > 2MK > HP > 236HP > j.236PP > 236K ~ LK > 236LP', 2565, '3 barras de Drive',
 'Termina +35F.'),
('throw-dr', 26, 'Throw > DR > MP (acertou: combo +47F)', 'Drive Rush',
 'Throw > DR > MP > 2MP > MP ~ HP > 236K ~ MK', null, '1 barra de Drive',
 'Depois do throw, DR e MP chegando meaty. Se acertar, segue o combo.'),

-- ===== Drive Impact =====
('di-pc', 30, 'DI (PC) > 2HP > 236HP > j.236P (+22F)', 'Drive Impact',
 'DI (PC) > 2HP > 236HP > j.236P', 2682, '1 barra de Drive',
 'Termina +22F.'),
('di-pc-od', 31, 'DI (PC) > 2HP > OD aéreo (+35F)', 'Drive Impact',
 'DI (PC) > 2HP > 236HP > j.236PP > 236K ~ LK > 236LP', 2961, '3 barras de Drive',
 'Termina +35F.'),
('di-canto', 32, 'Canto: DI > 2HP > 236K~LK > j.236P (+22F)', 'Drive Impact',
 'DI > 2HP > 236K ~ LK > j.236P', 2217, '1 barra de Drive',
 'No canto funciona com o DI bloqueado ou acertando.'),
('di-canto-od', 33, 'Canto: DI > 2HP > OD aéreo (+35F)', 'Drive Impact',
 'DI > 2HP > 236K ~ LK > j.236PP > 236K ~ LK > 236LP', 2628, '3 barras de Drive',
 'No canto funciona com o DI bloqueado ou acertando.'),

-- ===== Punish Counter =====
('pc-lk', 40, 'LK (PC) > 236MP (+37F)', 'Punish Counter',
 'LK (PC) > 236MP', 1188, 'Sem barra',
 'Punição rápida com botão leve.'),
('pc-2mp', 41, '2MP (PC) > HP > OD aéreo (+35F)', 'Punish Counter',
 '2MP (PC) > HP > 236HP > j.236PP > 236K ~ LK > 236LP', 3066, '2 barras de Drive (+3 de Super com SA3)',
 'Punição de Drive Reversal. Dá para fechar com SA3.'),
('pc-hp-mk', 42, 'HP (PC) > 236K~P > HK > MP~HP (+47F)', 'Punish Counter',
 'HP (PC) > 236K ~ P > HK > MP ~ HP > 236K ~ MK', 2502, 'Sem barra',
 'Punição de shimmy e de DP bloqueado.'),
('pc-hp-od', 43, 'HP (PC) > 236K~P > HP > OD aéreo (+35F)', 'Punish Counter',
 'HP (PC) > 236K ~ P > HP > 236HP > j.236PP > 236K ~ LK > 236LP', 3222, '2 barras de Drive',
 'Punição de shimmy e de DP bloqueado. Mais dano, menos vantagem que a rota sem barra.'),

-- ===== Plantar bomba (22P) no fim do combo =====
('bomb-tc', 50, 'Bomba: canto, target combo > 22MP (+5F)', 'Setup de recurso',
 'LP ~ MP ~ HP ~ HK > 22MP', null, 'Sem barra (2 de Drive com 22MP+HP)',
 'No canto. Pode trocar o 22MP por 22MP+HP (OD). Fica +5F com a bomba plantada.'),
('bomb-mk', 51, 'Bomba: perto do canto, 236K~MK > 22MP (+3F)', 'Setup de recurso',
 'MP ~ HP > 236K ~ MK > 22MP', null, 'Sem barra (2 de Drive com 22MP+HP)',
 'O final +47F vira +3F com a bomba plantada. Pode trocar por 22MP+HP (OD).'),
('bomb-od-air', 52, 'Bomba: perto do canto, OD aéreo > 22HP (+11F)', 'Setup de recurso',
 'HP > 236HP > j.236PP > 236K ~ LK > 22HP', null, '2 barras de Drive',
 'O final +35F vira +11F com a bomba. Pode trocar por 22MP+HP (OD).'),
('bomb-arc', 53, 'Bomba: perto do canto, OD Arc Step > 2LP whiff > 22HP (+9F)', 'Setup de recurso',
 'MP ~ HP > 236KK ~ Arc Step ~ K > 2LP (whiff) > 236K ~ LK > 22HP', null, '2 barras de Drive',
 'O 2LP é de propósito no vazio, para acertar o timing. Pode trocar por 22MP+HP (OD).'),

-- ===== Setup universal com 1 bomba =====
('b1-throw', 60, '1 bomba: Throw > OD aéreo > 22HP (+11F)', 'Setup de recurso',
 'Throw > j.236PP > 236K ~ LK > 22HP', 1941, '2 barras de Drive',
 'Setup universal de 1 bomba. Termina +11F com bomba plantada.'),
('b1-shimmy', 61, '1 bomba: shimmy > HP (PC) > 22HP (+9F)', 'Setup de recurso',
 'Backdash shimmy > HP (PC) > 214P > 2HP > 214P > MP > 236K ~ LK > 22HP', 2700, 'Sem barra',
 'Oponente tentou throw ou apertou no seu backdash: HP pega punish counter.'),
('b1-drev', 62, '1 bomba: bloqueou Drive Reversal > j.214KK > 22MP (+5F)', 'Setup de recurso',
 'MP > 236K ~ LK > j.MP > j.214KK > 22MP', 2943, '2 barras de Drive',
 'Depois de bloquear o Drive Reversal do oponente.'),
('b1-tc-throw', 63, '1 bomba: MP~HP bloqueado > 236K~P > Throw', 'Setup de recurso',
 'MP ~ HP (bloqueado) > 236K ~ P > Throw', null, 'Sem barra',
 'Opção de throw na pressão.'),
('b1-tc-hk', 64, '1 bomba: MP~HP bloqueado > 236K~HK > j.214KK (+5F)', 'Setup de recurso',
 'MP ~ HP (bloqueado) > 236K ~ HK > j.MP > j.214KK > 22MP', 2655, '2 barras de Drive',
 'Termina +5F com bomba plantada.'),
('b1-tc-mk', 65, '1 bomba: MP~HP bloqueado > 236K~MK > OD aéreo (+11F)', 'Setup de recurso',
 'MP ~ HP (bloqueado) > 236K ~ MK > 236K ~ LK > j.236PP > 236K ~ LK > 22HP', 2610, '2 barras de Drive',
 'Termina +11F com bomba plantada.'),
('b1-tc-hit', 66, '1 bomba: MP~HP acertou > 236LP > j.214KK (+5F)', 'Setup de recurso',
 'MP ~ HP > 236LP > 236LK ~ LK > j.MP > j.214KK > 22MP', 3168, '2 barras de Drive',
 'Termina +5F com bomba plantada.'),

-- ===== Setup universal com 2 bombas =====
('b2-drev', 70, '2 bombas: bloqueou Drive Reversal > 22HP (+11F)', 'Setup de recurso',
 'MP > MP (whiff) > 214P > 2HP > 214P > 2HP > 236K ~ LK > 22HP', 3168, 'Sem barra',
 'Depois de bloquear o Drive Reversal do oponente. O segundo MP é no vazio.'),
('b2-shimmy', 71, '2 bombas: shimmy > HP (PC) > 236LP > 22HP (+11F)', 'Setup de recurso',
 'Backdash shimmy > HP (PC) > 236LP > 2MK (whiff) > 214P > 2HP > 214P > 2HP > 236K ~ LK > 22HP', 3672, 'Sem barra',
 'Oponente tentou throw ou apertou no seu backdash. O 2MK é no vazio.'),
('b2-tc-mk', 72, '2 bombas: MP~HP bloqueado > 236LP > 236K~MK (+6F)', 'Setup de recurso',
 'MP ~ HP (bloqueado) > 236LP > 236K ~ MK > 236K ~ LK > j.MP > j.214KK > 22MP', 2655, '2 barras de Drive',
 'Termina +6F com bomba plantada.'),
('b2-tc-4hk', 73, '2 bombas: MP~HP bloqueado > 236LP > 4HK (+11F)', 'Setup de recurso',
 'MP ~ HP (bloqueado) > 236LP > 4HK > 236K ~ LK > j.236PP > 236K ~ LK > 22HP', 2452, '2 barras de Drive',
 'Termina +11F com bomba plantada.'),
('b2-tc-hit', 74, '2 bombas: MP~HP acertou > 236LP > 2HK (+9F)', 'Setup de recurso',
 'MP ~ HP > 236LP > 2HK > 214P > 2HP > 214P > MP > 236K ~ LK > 22HP', 3465, 'Sem barra',
 'Termina +9F com bomba plantada.'),

-- ===== Oki: o que fazer depois dos setups =====
('throw-dr-block', 80, 'Throw > DR > MP bloqueado (+3F)', 'Okizeme',
 'Throw > DR > MP', null, '1 barra de Drive',
 'Se o MP for bloqueado você fica +3F: continue a pressão (botão rápido ganha, throw de novo, shimmy).'),
('oki-throw-delay', 81, 'Depois de 22MP+HP (+5F/+3F): Throw > delay 214P (+9F)', 'Okizeme',
 'Throw > delay 214P > 2HP > 214P > MP > 236K ~ LK > 22HP', 2499, 'Sem barra',
 'Vale depois dos setups 22MP+HP +5F e +3F, e de 236LK~LK > delay 22MP+HP. Atrase o 214P depois do throw.'),
('oki-dp-bomb', 82, 'Depois de 22MP+HP (+5F/+3F): DP bloqueado > bomba acerta (+9F)', 'Okizeme',
 'DP (bloqueado) > bomba acerta > 214P > 2HP > 214P > MP > 236K ~ LK > 22HP', 2484, 'Sem barra',
 'Oponente deu DP no seu setup: bloqueie, a bomba acerta ele e você combina.'),
('oki-dp-pc', 83, 'Depois de 22MP+HP (+11F/+9F): DP bloqueado > HP (PC) (+6F)', 'Okizeme',
 'DP (bloqueado) > HP (PC) > 236K ~ LK > j.MP > j.214KK > 22MP', 3051, '2 barras de Drive',
 'Vale depois dos setups 22MP+HP +11F e +9F. Bloqueou o DP: HP pega punish counter.');

-- Apaga os 12 combos modelo vazios ("Carregar situações modelo") da Kimberly.
-- Só some o que ainda está intocado: sem sequência, dano, custo, vídeo nem notas.
delete from public.combos
where main = 'Kimberly'
  and notation = '' and dmg is null and cost = '' and video = '' and notes = ''
  and title in ('BnB meterless', 'BnB com Drive Rush', 'Confirmação de anti-aéreo',
                'Punição leve (início de combo)', 'Punição pesada (movimento recuperável)',
                'Confirmação após Drive Impact (parede)', 'Dano máximo no canto',
                'Combo com Super Art 1', 'Combo com Super Art 2', 'Combo com Super Art 3',
                'Continuação após parry perfeito', 'Knockdown + setup básico');

-- A Kimberly entra na lista de personagens de quem já usa o site
insert into public.mains (user_id, char)
select u.id, 'Kimberly' from auth.users u
on conflict do nothing;

-- Combos: id fixo por usuário + combo, então rodar de novo não duplica
insert into public.combos (id, user_id, main, title, sit, notation, dmg, cost, status, video, notes, created_at)
select md5(u.user_id::text || ':kimberly:' || c.k)::uuid, u.user_id, 'Kimberly',
       c.title, c.sit, c.notation, c.dmg, c.cost, 0,
       'https://www.youtube.com/watch?v=L77BwLi1q6g', c.notes,
       now() + c.ord * interval '1 millisecond'
from (select id as user_id from auth.users) u
cross join kim_combos c
on conflict (id) do nothing;

-- Fluxogramas. "lk": "c:@chave" vira o link para o combo daquele usuário.
create temp table kim_flows (k text primary key, ord int, title text, root text);

insert into kim_flows (k, ord, title, root) values
('oki-vantagem', 1, 'Oki: quanto tempo eu tenho?', $j$
{"id":"r","type":"s","lk":"","t":"Derrubei o oponente. Olhar quantos frames o combo deixa (o +F no nome do combo).","kids":[
  {"id":"a","type":"d","lk":"","t":"+3F (fim em 236LP: 2LP > 2LP > 236LP, 4HK > 2LP > 236LP)","kids":[
    {"id":"a1","type":"a","lk":"c:@bnb-2lp","t":"Sem tempo de setup. Pressão direto: botão rápido ganha do botão dele, ou throw.","kids":[]},
    {"id":"a2","type":"a","lk":"","t":"Ele aperta botão no seu +3F? Shimmy (andar para trás) e punir.","kids":[]}]},
  {"id":"b","type":"d","lk":"","t":"+21F / +22F (214LK, 214HK no canto, j.236P)","kids":[
    {"id":"b1","type":"a","lk":"","t":"Andar e fazer meaty com normal, ou shimmy.","kids":[]},
    {"id":"b2","type":"a","lk":"","t":"Não dá para plantar bomba: pelos combos, o 22HP gasta uns 24F (+35F vira +11F).","kids":[]}]},
  {"id":"c","type":"d","lk":"","t":"+35F / +36F (finais com OD aéreo e 236LP)","kids":[
    {"id":"c1","type":"a","lk":"c:@bomb-od-air","t":"Perto do canto: trocar o 236LP por 22HP e ficar +11F com bomba.","kids":[]},
    {"id":"c2","type":"a","lk":"","t":"Sem bomba: Sprint (236K) e mix, ou andar e meaty.","kids":[]}]},
  {"id":"d","type":"d","lk":"","t":"+47F / +49F (236K~MK, target combo)","kids":[
    {"id":"d1","type":"a","lk":"c:@bomb-mk","t":"Perto do canto: 22MP e ainda fica +3F com bomba.","kids":[]},
    {"id":"d2","type":"a","lk":"c:@bomb-tc","t":"Canto com target combo: 22MP e fica +5F.","kids":[]},
    {"id":"d3","type":"a","lk":"","t":"Sem bomba: tempo de sobra para chegar perto e escolher o mix.","kids":[]}]}
]}
$j$),
('oki-throw', 2, 'Oki: acertei throw', $j$
{"id":"r","type":"s","lk":"","t":"Acertei throw","kids":[
  {"id":"a","type":"d","lk":"","t":"Tenho 1 barra de Drive e quero pressão?","kids":[
    {"id":"a1","type":"a","lk":"c:@throw-dr","t":"DR > MP meaty. Acertou: combo até 236K~MK (+47F).","kids":[]},
    {"id":"a2","type":"a","lk":"c:@throw-dr-block","t":"Bloqueou: MP fica +3F, continua a pressão.","kids":[]}]},
  {"id":"b","type":"d","lk":"","t":"Tenho 2 barras e quero bomba?","kids":[
    {"id":"b1","type":"a","lk":"c:@b1-throw","t":"Throw > j.236PP > 236K~LK > 22HP: +11F com bomba.","kids":[]}]},
  {"id":"c","type":"d","lk":"","t":"Já tem bomba na tela (depois de 22MP+HP +5F/+3F)?","kids":[
    {"id":"c1","type":"a","lk":"c:@oki-throw-delay","t":"Throw > delay 214P > combo > 22HP (+9F).","kids":[]}]}
]}
$j$),
('oki-1bomba', 3, 'Oki com 1 bomba na tela', $j$
{"id":"r","type":"s","lk":"","t":"1 bomba plantada, oponente levantando","kids":[
  {"id":"a","type":"d","lk":"","t":"Ele bloqueou meu MP~HP?","kids":[
    {"id":"a1","type":"a","lk":"c:@b1-tc-mk","t":"236K~MK e segue o combo: +11F com bomba.","kids":[]},
    {"id":"a2","type":"a","lk":"c:@b1-tc-hk","t":"236K~HK e segue: +5F com bomba.","kids":[]},
    {"id":"a3","type":"a","lk":"c:@b1-tc-throw","t":"Ele está segurando bloqueio: 236K~P > Throw.","kids":[]}]},
  {"id":"b","type":"d","lk":"","t":"MP~HP acertou?","kids":[
    {"id":"b1","type":"a","lk":"c:@b1-tc-hit","t":"236LP e segue o combo: +5F com bomba.","kids":[]}]},
  {"id":"c","type":"d","lk":"","t":"Ele usou Drive Reversal?","kids":[
    {"id":"c1","type":"a","lk":"c:@b1-drev","t":"Bloquear e punir: MP > 236K~LK > j.MP > j.214KK > 22MP (+5F).","kids":[]}]},
  {"id":"d","type":"d","lk":"","t":"Ele aperta botão ou tenta throw no wake-up?","kids":[
    {"id":"d1","type":"a","lk":"c:@b1-shimmy","t":"Shimmy (backdash) e HP no punish counter: +9F com bomba.","kids":[]}]},
  {"id":"e","type":"d","lk":"","t":"Ele deu DP?","kids":[
    {"id":"e1","type":"a","lk":"c:@oki-dp-bomb","t":"Setup +5F/+3F: bloquear, a bomba acerta, combo (+9F).","kids":[]},
    {"id":"e2","type":"a","lk":"c:@oki-dp-pc","t":"Setup +11F/+9F: bloquear e HP no punish counter (+6F).","kids":[]}]}
]}
$j$),
('oki-2bombas', 4, 'Oki com 2 bombas na tela', $j$
{"id":"r","type":"s","lk":"","t":"2 bombas plantadas, oponente levantando","kids":[
  {"id":"a","type":"d","lk":"","t":"Ele bloqueou meu MP~HP?","kids":[
    {"id":"a1","type":"a","lk":"c:@b2-tc-4hk","t":"236LP > 4HK e segue: +11F com bomba.","kids":[]},
    {"id":"a2","type":"a","lk":"c:@b2-tc-mk","t":"236LP > 236K~MK e segue: +6F com bomba.","kids":[]}]},
  {"id":"b","type":"d","lk":"","t":"MP~HP acertou?","kids":[
    {"id":"b1","type":"a","lk":"c:@b2-tc-hit","t":"236LP > 2HK e segue: +9F com bomba, sem barra.","kids":[]}]},
  {"id":"c","type":"d","lk":"","t":"Ele usou Drive Reversal?","kids":[
    {"id":"c1","type":"a","lk":"c:@b2-drev","t":"Bloquear e punir com MP: +11F com bomba, sem barra.","kids":[]}]},
  {"id":"d","type":"d","lk":"","t":"Ele aperta botão ou tenta throw no wake-up?","kids":[
    {"id":"d1","type":"a","lk":"c:@b2-shimmy","t":"Shimmy (backdash) e HP no punish counter: +11F com bomba.","kids":[]}]}
]}
$j$),
('punicao', 5, 'Punição: qual combo usar', $j$
{"id":"r","type":"s","lk":"","t":"Consegui punish counter","kids":[
  {"id":"a","type":"d","lk":"","t":"Só deu para punir com botão leve?","kids":[
    {"id":"a1","type":"a","lk":"c:@pc-lk","t":"LK (PC) > 236MP (+37F).","kids":[]}]},
  {"id":"b","type":"d","lk":"","t":"Bloqueei Drive Reversal?","kids":[
    {"id":"b1","type":"a","lk":"c:@pc-2mp","t":"2MP (PC) e combo com OD aéreo (+35F). SA3 no fim se matar.","kids":[]}]},
  {"id":"c","type":"d","lk":"","t":"Pegou shimmy ou DP bloqueado?","kids":[
    {"id":"c1","type":"a","lk":"c:@pc-hp-mk","t":"Sem barra: HP (PC) > 236K~P > HK > MP~HP > 236K~MK (+47F).","kids":[]},
    {"id":"c2","type":"a","lk":"c:@pc-hp-od","t":"Com 2 barras: HP (PC) > 236K~P > HP > OD aéreo (+35F, mais dano).","kids":[]}]}
]}
$j$);

  for v_user in select id as user_id from auth.users loop
    for v_flow in select * from kim_flows order by ord loop
      r := v_flow.root;
      for v_combo in select k from kim_combos loop
        r := replace(r, '"c:@' || v_combo.k || '"', '"c:' || md5(v_user.user_id::text || ':kimberly:' || v_combo.k)::uuid || '"');
      end loop;
      if r like '%"c:@%' then
        raise exception 'Fluxograma % aponta para combo que não existe', v_flow.k;
      end if;
      insert into public.flows (id, user_id, main, title, char, root, created_at, updated_at)
      values (md5(v_user.user_id::text || ':kimberly-flow:' || v_flow.k)::uuid, v_user.user_id, 'Kimberly',
              v_flow.title, '', r::jsonb,
              now() + v_flow.ord * interval '1 millisecond', now())
      on conflict (id) do nothing;
    end loop;
  end loop;

drop table kim_combos;
drop table kim_flows;

end $mig$;

-- Resumo: deve mostrar 49 combos e 5 fluxogramas por usuário
select u.email,
       (select count(*) from public.combos c where c.user_id = u.id and c.main = 'Kimberly') as combos_kimberly,
       (select count(*) from public.flows f where f.user_id = u.id and f.main = 'Kimberly') as fluxogramas_kimberly
from auth.users u;
