---
target: la page du manifeste
total_score: 19
p0_count: 0
p1_count: 3
timestamp: 2026-07-20T08-39-20Z
slug: app-src-pages-index-astro
---
# Critique du manifeste web

## Design Health Score

| # | Heuristique | Score | Problème principal |
|---|---|---:|---|
| 1 | Visibilité de l’état du système | 2/4 | La signature est annoncée comme réussie avant toute contribution GitHub. |
| 2 | Correspondance système / monde réel | 2/4 | Les « synonymes » et certaines légendes déforment les distinctions réelles. |
| 3 | Contrôle et liberté | 2/4 | Le dialogue se ferme, mais une redirection automatique démarre immédiatement. |
| 4 | Cohérence et standards | 1/4 | « Principles »/« commitments », « Outcome »/« Impact » et les versions web/Markdown divergent. |
| 5 | Prévention des erreurs | 1/4 | Le visiteur peut partager une fausse signature et un rang projeté. |
| 6 | Reconnaissance plutôt que rappel | 3/4 | Index, ancres et démonstrations sont repérables. |
| 7 | Flexibilité et efficacité | 2/4 | Le parcours est très long et les 54 signatures sont toutes dépliées. |
| 8 | Esthétique et minimalisme | 3/4 | Hiérarchie solide, mais longues dalles répétées et registre exhaustif diluent le propos. |
| 9 | Diagnostic et récupération d’erreur | 1/4 | Aucun état pending/rejected/retry n’explique la vraie publication GitHub. |
| 10 | Aide et documentation | 2/4 | Le contrat Git public n’est pas expliqué au moment de signer. |
| **Total** |  | **19/40** | **Faible — les incohérences de confiance dominent une base visuelle solide.** |

## Anti-Patterns Verdict

### Évaluation éditoriale

La page ne ressemble pas immédiatement à une landing page IA générique : la marque AIDD, le versioning, les permaliens et les démonstrations de workflow lui donnent une vraie autorité. Elle retombe toutefois dans un registre « developer brand » prévisible à la fin : « Be part of the movement! », rang projeté et célébration avant validation transforment un standard citable en funnel marketing.

### Scan déterministe

Le détecteur n’a remonté qu’un avertissement `overused-font` dans `app/src/styles/fonts.css:12`. C’est un faux positif : il matche `Inter` à l’intérieur de `Inter Tight`. Aucun autre anti-pattern automatique n’a été trouvé.

### Vérification visuelle

Le rendu local a été confirmé dans un onglet neuf. L’injection mutable fonctionnait, mais le script d’overlay a déclenché `onerror` malgré une réponse HTTP 200 ; aucun overlay utilisateur fiable n’a donc été affiché. Capture et inspection DOM ont confirmé le H1, les cinq sections et le rendu du cover.

## Impression générale

Le manifeste paraît sérieux jusqu’au moment où ses différentes représentations et son parcours de signature se contredisent. La plus grande opportunité est de traiter la page comme une norme gouvernée : un vocabulaire unique, une source canonique unique et aucun statut public annoncé avant validation.

## Ce qui fonctionne

1. L’identité de document versionné — `AIDD · Manifesto · v1.1 · 2026`, folios et index — rend le texte repérable et citable.
2. Les valeurs et la plupart des engagements sont concis, parallèles et mémorisables.
3. Les démonstrations 07 à 11 correspondent bien aux règles éditoriales : responsabilité DEV, READ/TEST avant délégation, phases nommées, compaction de contexte et diagnostic actionnable.

## Problèmes prioritaires

### [P1] La page déclare une signature qui n’existe pas encore

`SharePopup.astro` affiche « You signed », un rang `#55` et un texte « I just signed… » avant même l’ouverture du formulaire GitHub. Le vrai contrat est issue → PR générée → validation → revue → merge → publication dans le registre. Le site fabrique donc un statut public au moment où la confiance doit être maximale.

**Correction :** transformer le dialogue en préflight (« Start your public signature », rang projeté et statut pending), montrer les étapes réelles, et n’activer partage, rang définitif et confettis qu’après publication vérifiée. Conserver l’interface exclusivement en anglais.

**Commande suggérée :** `$impeccable clarify`

### [P1] Le manifeste web canonique omet son propre préambule

`index.astro` passe du cover à la définition, tandis que `manifesto.ts` contient « As AI-Driven Developers… » et qu’un composant `Preamble.astro` complet existe encore. Deux représentations prétendument canoniques n’exposent donc pas le même manifeste.

**Correction :** restaurer le préambule dans la composition et l’index, ou le supprimer explicitement de toutes les représentations. La restauration est préférable car il porte le passage du descriptif au normatif.

**Commande suggérée :** `$impeccable clarify`

### [P1] Les légendes « AIDD vs vibe coding » disent l’inverse des schémas

La figure Method se termine par « Do not care about code quality. » sous les deux parcours. La figure Over Time se termine par « High quality legacy code output. » sous un graphe où le vibe coding décroît vers la dette. Les légendes ne désignent pas leur sujet et sabotent le sens des illustrations.

**Correction :** écrire des conclusions explicitement attribuées (« AIDD: review before production… ») ou supprimer les légendes si les schémas suffisent.

**Commande suggérée :** `$impeccable clarify`

### [P2] Le standard n’a pas de vocabulaire stable

L’index et l’export parlent de « Principles », le titre visible et les démonstrations de « commitments ». La quatrième valeur est `Outcome`, mais son quadrant est `Impact`. Enfin, neuf pratiques différentes — prompt-driven development, agentic coding, context engineering, etc. — sont présentées comme synonymes alors qu’elles ne sont pas équivalentes.

**Correction :** définir un lexique canonique rendu partout depuis une seule source. Choisir « principles » ou « commitments », « Outcome » ou « Impact », et remplacer « Also known as » par « Related practices » avec une classification des recouvrements.

**Commande suggérée :** `$impeccable distill`

### [P2] Les preuves sont cachées, et les démos 01/12 ne démontrent pas leur texte

Chaque engagement possède un champ `proof`, mais `PrincipleCard.astro` ne l’affiche pas. La démo 01 montre seulement des cellules devenant vertes sans décomposition, tests/revue et release. La démo 12 produit `memory.md`, `rules.md` et `skills.md`, mais ne montre pas plusieurs personnes/outils produisant une qualité logicielle comparable.

**Correction :** afficher un « Framework trace » compact sous chaque engagement. Refaire 01 comme bloc → incréments → boucles test/review → release ; refaire 12 comme plusieurs personnes/outils traversant la même méthode puis franchissant les mêmes quality gates.

**Commande suggérée :** `$impeccable polish`

## Fidélité des démonstrations

| Démo | Verdict | Motif |
|---|---|---|
| 01 | Partielle | Vérification visible, mais ni décomposition ni chaîne spec/plan/tests/review/release. |
| 02 | Forte | `spec.md` écrit goal, intent, scope, acceptance et review. |
| 03 | Forte | Intentions DEV/PM, plan IA, exigences et codebase sont reliés. |
| 04 | Forte | Un gros travail est fractionné en paquets indépendants. |
| 05 | Forte | Code et Markdown passent par le même mécanisme de qualité. |
| 06 | Forte | L’apprentissage devient mémoire capturée et réutilisable. |
| 07 | Forte | Un développeur nommé révise puis assume la responsabilité. |
| 08 | Forte | READ et TEST précèdent explicitement DELEGATE. |
| 09 | Forte | Plan, Implement, Review et Test sont nommés. |
| 10 | Forte | Ancien chat → contexte compacté → nouveau chat. |
| 11 | Forte | L’échec mène à l’inspection du scope, contexte, hypothèses et tests. |
| 12 | Partielle | La méthode commune est visible, pas la qualité comparable des sorties. |

## Charge cognitive

La charge est élevée dans la signature et la fin de page : neuf pseudo-synonymes, douze engagements sans sous-groupes, 54 signataires entièrement dépliés et cinq voies concurrentes dans le dialogue de signature. Le visiteur doit surtout mémoriser et réconcilier « You signed » avec un workflow GitHub invisible qui n’a pas encore commencé.

## Persona Red Flags

**Jordan — première visite :** prend « You signed » littéralement ; ne comprend pas pourquoi neuf pratiques différentes sont appelées synonymes ; ne voit ni PR, ni revue, ni publication dans la promesse de signature.

**Riley — test méthodique :** repère immédiatement la divergence HTML/Markdown, `Outcome`/`Impact`, `Principles`/`commitments`, le rang fictif en concurrence et l’absence d’état rejected. Une locale française déclenche en outre du français dans une interface officiellement monolingue.

**Casey — mobile distrait :** l’index disparaît sur mobile, les quatre valeurs très hautes et les 54 signatures rendent la reprise difficile, puis la signature impose une redirection temporisée sans expliquer ce qui sera conservé.

**Morgan — engineering lead :** le versioning inspire confiance, mais les divergences canoniques et la célébration prématurée donnent l’impression d’une campagne marketing plutôt que d’une norme gouvernée.

## Observations mineures

- « Be among the first » est périmé avec 54 signataires et crée une urgence artificielle.
- « Be part of the movement! » est générique et moins précis que le reste du manifeste.
- « Written in 🇫🇷 » peut signifier « écrit en français » ; « Created in France » serait sans ambiguïté.
- « The only number that serves is the business » contredit la démo « users impacted +410 » et exclut fiabilité, sécurité ou intérêt public.
- Le mur exhaustif de signatures apporte de la preuve sociale mais termine le manifeste comme un annuaire.

## Questions à considérer

1. À quel événement exact devient-on signataire : clic, issue, PR ou merge ?
2. AIDD est-il une norme prescriptive ou une étiquette englobant toute pratique de code assisté par IA ?
3. Quelle représentation est canonique lorsque HTML et Markdown divergent, et ce contrat peut-il être testé automatiquement ?
4. Un organisme de standard célébrerait-il un membre avant sa revue, ou expliquerait-il d’abord la gouvernance ?
