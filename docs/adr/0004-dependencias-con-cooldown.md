# ADR-0004 · Dependencias sin scripts de instalación y con espera de 7 días

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
Next 15.5.22 tenía advisories (1 crítico, 5 altos). No había Dependabot, ni CI, ni bloqueo de scripts de instalación (issue #4). Además, una instalación común (`npm i -D vitest`) trajo transitivas publicadas hacía 0 a 6 días: justo la ventana en la que suele circular una versión maliciosa antes de que la despubliquen.

## Decisión
- **`.npmrc` con `ignore-scripts=true` y `min-release-age=7`** (npm 11: no instala versiones de menos de 7 días).
- **`.github/dependabot.yml`** para npm y github-actions, con `cooldown` de 7 días y minors/patches agrupados.
- **CI en cada PR**: typecheck, tests, build y `npm audit --omit=dev --audit-level=high`, con las actions fijadas por SHA.
- **`overrides` de postcss dentro de Next** (8.4.31 → 8.5.32). La rama 15 de Next la fija en una versión con advisories altos, y el arreglo oficial es Next 16 (major).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Pasar a Next 16 | Major; sin necesidad de features nuevas. Queda para un PR de Dependabot propio. |
| Renovate | Más configuración; Dependabot alcanza para un repo. |
| Dejar la postcss de Next | Es solo de build, pero hace fallar el audit de la CI y tapa advisories nuevos. |

## Consecuencias
- Una actualización urgente de seguridad no espera el cooldown: Dependabot security updates la manda en el momento (hay que tenerlo prendido en Settings).
- El `overrides` hay que sacarlo al pasar a Next 16.

## Cómo se verifica
`npm audit --package-lock-only` da 0 vulnerabilidades; `npm install --dry-run postcss@8.5.33` falla por `min-release-age`; la CI corre en cada PR.
