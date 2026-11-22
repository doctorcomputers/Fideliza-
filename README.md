# Fideliza Torrevieja — Explorar Comercios y Red Cruzada

> **Práctica para ACADEMIARTIFICIAL — PROGRAMA INTENSIVO DE IA GENERATIVA**  
> **PUEDES DESCARGAR EL PROGRAMA AQUÍ:** [Programa Intensivo de IA Generativa (PDF)](https://academiartificial.com/wp-content/uploads/2026/08/Programa-Intensivo-de-IA-Generativa-general-VI.pdf)

---

## Descripción del proyecto

**Fideliza Torrevieja** es una aplicación web interactiva orientada a la dinamización del comercio local de Torrevieja mediante una **red de alianzas cruzadas** entre establecimientos reales asociados a **APYMECO** ([www.apymeco.info](https://www.apymeco.info)) y un **pasaporte digital de sellos**.

Cada compra realizada en un comercio adherido suma sellos al pasaporte ciudadano y desbloquea automáticamente ventajas y descuentos cruzados en otros comercios vecinos de la red. Al completar los **8 sellos** del pasaporte, el usuario obtiene un bono directo y queda registrado en el sorteo de un **iPhone 18 Pro**.

---

## Funcionalidades principales

- **Cartel protagonista de campaña**: Destacado principal en portada (*«Completa la ruta y gana un iPhone 18 Pro»*) con seguimiento en tiempo real de sellos acumulados.
- **Explorador interactivo de Red Cruzada**:
  - **Grafo de Alianzas**: Visualización de nodos y conexiones bidireccionales entre comercios asociados de APYMECO.
  - **Plano de Distritos de Torrevieja**: Mapa esquemático de barrios (*Centro*, *Playa del Cura*, *La Mata*, *Acequión y Parque Naciones*) con ubicación e inspección de beneficios cruzados.
- **Directorio de comercios asociados APYMECO**:
  - Buscador instantáneo por nombre, calle o comercio aliado.
  - Filtros por categoría comercial, barrio, comercios con alianza activa y favoritos guardados.
  - Ficha detallada lateral con enlaces a la ficha oficial en `apymeco.info`, canje de vales cruzados y simulador de registro de compra/sellado.
- **Pasaporte Ciudadano y Tarjeta QR**:
  - Cuadrícula interactiva 4×2 de sellos digitales con selector de perfil (*Residente* / *Visitante*) y lista de vales activos.
  - Modal tipo ticket perforado con **código QR dinámico en SVG**, hash de verificación, temporizador de validez de 60 segundos y simulador de lectura en TPV.
- **Rutas temáticas de Red Cruzada**: Circuitos comerciales recomendados de 3 paradas que filtran y resaltan los establecimientos participantes en el mapa y el directorio.

---

## Comercios asociados incluidos (`www.apymeco.info`)

| Comercio | Categoría | Barrio | Dirección |
| :--- | :--- | :--- | :--- |
| **Doctor Computers** | Tecnología y Papelería | Acequión y Parque Naciones | Calle Antonio Machado, 51, bajo |
| **Librería Papelería Trini** | Tecnología y Papelería | Centro | Calle Ramón Gallud, 128 |
| **Óptica Chantal** | Salud, Óptica y Estética | Centro | Calle Ramón Gallud, 62 |
| **Andrés Gourmet Selección** | Alimentación y Gastronomía | Centro | Calle Ramón Gallud, 62 |
| **Calzados Toñi** | Moda, Joyería y Hogar | Centro | Calle Ramón Gallud, 50 |
| **Perfumería Riera** | Salud, Óptica y Estética | Centro | Calle Ramón Gallud, 66 |
| **Joyería Montecarlo** | Moda, Joyería y Hogar | Centro | Calle Fotógrafos Darblade, 21 |
| **Floristería Carmina** | Moda, Joyería y Hogar | Centro | Calle Ramón Gallud, 40 |
| **Pastelería Dulce de Leche** | Alimentación y Gastronomía | Centro | Calle Caballero de Rodas, 106 |
| **Herbolario Aloe's** | Salud, Óptica y Estética | Centro | Calle Caballero de Rodas, 72 |
| **Náutica Martínez** | Náutica y Ocio | Acequión y Parque Naciones | Urb. Parque de las Naciones, s/n |
| **Odisea Diving** | Náutica y Ocio | Playa del Cura | Calle Huerto, 6 |
| **Farmacia Fragata 36** | Salud, Óptica y Estética | Playa del Cura | Calle Fragata, 36 |
| **Pescados Lorca** | Alimentación y Gastronomía | Acequión y Parque Naciones | Calle Gavia, 13 |
| **Ferretería Conesa** | Moda, Joyería y Hogar | Acequión y Parque Naciones | Calle Villa Madrid, 1 |
| **Panadería Miguel Hernández** | Alimentación y Gastronomía | La Mata | Calle Mayor, 23, La Mata |

---

## Stack tecnológico

- **Frontend:** React 19 + TypeScript
- **Build & Dev Server:** Vite
- **Estilos:** Tailwind CSS v4
- **Iconografía:** Lucide React
- **Tipografías:** Plus Jakarta Sans, DM Sans y JetBrains Mono (numeración tabular)

---

## Instalación y ejecución en local

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo** (puerto `3000`)
   ```bash
   npm run dev
   ```

4. **Comprobar tipos y compilar para producción**
   ```bash
   npm run lint
   npm run build
   ```

---

## Estructura del proyecto

```text
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── assets/
    │   └── images/
    ├── components/
    │   ├── MerchantCard.tsx
    │   ├── MerchantDetailDrawer.tsx
    │   ├── MerchantIllustration.tsx
    │   ├── QrMatrixSvg.tsx
    │   ├── QrTicketModal.tsx
    │   ├── RedCruzadaExplorer.tsx
    │   └── StampPassportCard.tsx
    ├── data/
    │   └── torreviejaData.ts
    └── types/
        └── commerce.ts
```

---

## Créditos y referencias

- **Práctica realizada:** Pedro García — [www.doctorcomputers.es](https://www.doctorcomputers.es)
- **Práctica académica:** [ACADEMIARTIFICIAL — Programa Intensivo de IA Generativa](https://academiartificial.com/wp-content/uploads/2026/08/Programa-Intensivo-de-IA-Generativa-general-VI.pdf)
- **Directorio comercial de referencia:** [APYMECO Torrevieja](https://www.apymeco.info) (Calle Ramón Gallud, 145 B, 03182 Torrevieja, Alicante)
