# API tests

Playwright API tests run against the ReqRes API at `https://reqres.in/api`.

ReqRes nõuab API-võtit ja `X-Reqres-Env: prod` päist. Projekti konfiguratsioon kasutab collection endpointi `GET /collections?project_id=51253`.

Kui `.env` faili ei kasutata, määra väärtused enne testide käivitamist:

```powershell
$env:REQRES_API_KEY = "your-api-key"
$env:REQRES_ENV = "prod"
$env:REQRES_PROJECT_ID = "51253"
npm test
```

GitHub Actions jaoks lisa repository secrets: `REQRES_API_KEY`, `REQRES_ENV` ja `REQRES_PROJECT_ID`. Workflow annab need testidele keskkonnamuutujatena.

Workflow saab GitHubis käivitada ka käsitsi (`Run workflow`). Sisendis `test_tag` saab valida, milliseid teste käivitada, näiteks `@smoke` või `@negative`. Push ja pull request käivitavad vaikimisi kogu testikomplekti.

Push’i ja käsitsi käivitamise korral publitseeritakse Playwright HTML-raport GitHub Pagesisse. Enne esimest kasutamist vali repository seadetes Pages’i source’iks `GitHub Actions`. Raporti URL kuvatakse workflow summary’s `github-pages` environment’i all.

## Commands

```powershell
npm test
npm run typecheck
npm run test:ui
npm run test:report
```

Tests use Playwright's `request` fixture and the `baseURL` configured in `playwright.config.ts`.

API endpointid on kapseldatud `api/` kaustas olevatesse klientklassidesse. Mudelid asuvad `models/` kaustas, testandmete factory’d `factories/` kaustas ja custom fixture’id `fixtures/` kaustas.
