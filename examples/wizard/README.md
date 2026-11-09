# Mago e auras

Um mago original desenhado em código e duas auras novas para a biblioteca.

## Efeitos novos

- `status/storm-aura` (**aura de raio**): uma corrente elétrica contorna o corpo, pulsos de luz correm pelo
  contorno, faíscas saltam da borda, orbes giram em volta e estrelas piscam ao redor. Ela lê o contorno do
  personagem (`o.actor.mask`), então no jogo basta passar a máscara do quadro atual do sprite e ela acompanha
  qualquer pose.
- `status/power-aura` (**aura de energia**): um casulo de energia em volta do corpo, com partículas girando e um
  anel de luz no chão.

Troque a cor com `palette`, por exemplo `{ palette: PAL.arcane }`, `PAL.gold` ou `PAL.electric`.

## Exemplos

Todos rodam a partir da raiz do repositório e gravam um vídeo (precisa do ffmpeg).

| arquivo | o que faz |
|---|---|
| `wizard.mjs` | o mago: chapéu com dobras, barba em mechas, túnica bordada, cinto com bolsinha, capa com forro e cajado com cristal. `drawWizard(p, { t, walk, phase, raise, orb, orbLit })` |
| `scene.mjs` | o mago parado, andando, erguendo o cajado com a aura de raio e o círculo de runas, e a explosão de mana. `node examples/wizard/scene.mjs` |
| `hero-walk.mjs` + `walk.mjs` | um herói andando com a aura de raio. `node examples/wizard/hero-walk.mjs arcane` |
