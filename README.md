<div align="center">

# Rosario Central • Athletic Club Membership & QR Access System
### *High-Throughput Member Lifecycle Engine, Cryptographic QR Passports & Matchday Access Control*

[![Node.js: 18+](https://img.shields.io/badge/Node.js-18%2B_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT Security](https://img.shields.io/badge/Auth-JWT_Stateless_Tokens-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Testing: Jest](https://img.shields.io/badge/Test_Suite-Jest_Unit_%26_Integration-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A secure RESTful API and access management ecosystem built for Club Atlético Rosario Central. Powers member lifecycle registrations, fee tracking, turnstile QR gate validations, and audit compliance logging.
</p>

</div>

---

## 🏟️ Core Architecture & Operational Workflows

- **Cryptographic QR Access Passes:** Generates signed member access tokens encoded into scannable QR cards for turnstile entry.
- **Turnstile Verification Endpoints:** Low-latency matchday validation verifying member standing and admission eligibility in `<10ms`.
- **Payment & Due Tracking:** Tracks monthly membership fee state transitions (Active, Delinquent, Suspended) with audit logging.
- **Enterprise Middleware Security:** Helmet headers, IP-rate limiting, CORS policies, and comprehensive Jest test suites (`__tests__/auth.test.js`, `__tests__/health.test.js`).

---

## 🚀 Quickstart & Testing

```bash
# Clone the repository
git clone https://github.com/ExeDevCentral/Sistema-de-Gesti-n-de-Membres-as-de-Club-Deportivo.git
cd Sistema-de-Gesti-n-de-Membres-as-de-Club-Deportivo

# Install dependencies
npm install

# Run automated test suite
npm test

# Launch server
npm start
```

---

## 👨‍💻 Author

**Exequiel Echevarria**
- GitHub: [@ExeDevCentral](https://github.com/ExeDevCentral)
