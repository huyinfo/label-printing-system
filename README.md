# LabelFlow: Patient Label Printing

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/huyinfo/label-printing-system)

LabelFlow is a minimalist, single-page web application designed for the rapid printing of patient information labels. It streamlines the workflow for clinical or administrative staff by allowing them to import patient data directly from an Excel file (.xlsx, .csv) or a public Google Sheet. The application is specifically configured for use with a Zebra GK420t printer, generating labels precisely formatted to 50x30mm.

The user interface is clean, intuitive, and focuses on a simple, three-step process: import, select, and print. A key feature is its session-only data handling model, ensuring patient privacy as no data is stored on any server or after the browser session ends.

## Key Features

-   **Flexible Data Import**: Load patient data from local Excel (.xlsx, .csv) files or public Google Sheets.
-   **Optimized for Zebra Printers**: Specifically designed to generate labels for the Zebra GK420t with a 50x30mm label size.
-   **Batch & Individual Printing**: Print labels for a single patient or an entire batch with ease.
-   **Privacy First**: All data is processed entirely on the client-side. No patient information is ever sent to or stored on a server.
-   **Intuitive Interface**: A clean data preview table with simple selection controls.
-   **Streamlined Workflow**: A simple three-step process: Import, Select, and Print.

## Technology Stack

-   **Frontend**: React, Vite, TypeScript
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **Routing**: React Router
-   **Data Parsing**: `xlsx` library
-   **UI/UX**: Framer Motion (animations), Sonner (notifications), Lucide React (icons)
-   **Deployment**: Cloudflare Workers

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Git](https://git-scm.com/) for cloning the repository.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd labelflow_patient_printing
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    ```sh
    bun dev
    ```
    The application will be available at `http://localhost:3000`.

## Usage

The application is designed for a straightforward user journey:

1.  **Import Data**:
    -   Navigate to the **Upload File** tab and drag-and-drop your Excel/CSV file, or click to browse.
    -   Alternatively, switch to the **Google Sheet URL** tab, paste the URL of a *publicly accessible* Google Sheet, and click "Load Data".

2.  **Select Patients**:
    -   Once the data is loaded, it will appear in the "Patient Data" table.
    -   Use the checkboxes to select the patients you wish to print labels for.
    -   You can use the checkbox in the table header to select or deselect all patients at once.

3.  **Print Labels**:
    -   The "Print Selected Labels" button will become active once at least one patient is selected.
    -   Click the button. A new browser tab will open with a print-ready preview of the labels.
    -   The browser's native print dialog will automatically appear.
    -   Select your Zebra GK420t printer, ensure print settings are set to "Actual Size" or 100% scale, and confirm the print job.

## Development

The codebase is structured to be clean and maintainable.

-   `src/pages/HomePage.tsx`: The main single-page application UI and logic.
-   `src/pages/PrintPage.tsx`: The dedicated, print-optimized view for rendering labels.
-   `src/stores/patientStore.ts`: The Zustand store for managing all application state (patient list, selections, loading states).
-   `src/lib/parser.ts`: Contains the client-side logic for parsing Excel files and fetching Google Sheet data.
-   `src/components/ui/`: Contains all shadcn/ui components.

## Deployment

This application is configured for seamless deployment to the Cloudflare network.

1.  **Build the application:**
    ```sh
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    Make sure you have the Wrangler CLI installed and configured. Then, run:
    ```sh
    bun run deploy
    ```
    This command will build the project and deploy it using Wrangler.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/huyinfo/label-printing-system)

## Limitations

-   **Browser Print Dialog**: Direct, silent printing to a specific printer is not possible from web applications due to security restrictions. This app relies on the standard browser print dialog.
-   **Google Sheets Accessibility**: The Google Sheets integration only works for sheets that are publicly accessible via the "Anyone with the link can view" sharing setting.
-   **Data Formatting**: The input data (Excel/Sheet) must have consistent column headers (e.g., 'Name', 'DOB', 'MRN') for the parser to work correctly.
-   **Print Scaling**: For precise 50x30mm label printing, users must ensure their browser's print settings are configured to 'Actual Size' or 100% scale, with margins set to none.