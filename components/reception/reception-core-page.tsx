import { ReceptionSidebar, ReceptionTopbar, getReceptionView } from "./reception-shell";
import { ReceptionDashboardView } from "./reception-dashboard";
import { ReceptionPatientsView } from "./reception-patients";
import { ReceptionAddPatientView } from "./reception-add-patient";
import { ReceptionPatientDetailsView } from "./reception-patient-details";
import { ReceptionCreateVisitView } from "./reception-create-visit";
import { ReceptionVisitQueueView } from "./reception-visit-queue";
import { ReceptionCompletedVisitsView } from "./reception-completed-visits";

export function ReceptionCorePage({ segments }: { segments?: string[] }) {
  const view = getReceptionView(segments);
  const active =
    view === "dashboard" ? "Dashboard" :
    view === "patients" || view === "add-patient" || view === "patient-details" ? "Patients" :
    view === "create-visit" || view === "visit-queue" || view === "completed-visits" ? "Appointments" :
    "Dashboard";

  return (
    <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
      <ReceptionSidebar active={active} />
      <section className="min-h-screen pl-[260px]">
        <ReceptionTopbar searchPlaceholder="Search patients, records..." />
        {view === "dashboard" && <ReceptionDashboardView />}
        {view === "patients" && <ReceptionPatientsView />}
        {view === "add-patient" && <ReceptionAddPatientView />}
        {view === "patient-details" && <ReceptionPatientDetailsView />}
        {view === "create-visit" && <ReceptionCreateVisitView />}
        {view === "visit-queue" && <ReceptionVisitQueueView />}
        {view === "completed-visits" && <ReceptionCompletedVisitsView />}
      </section>
    </main>
  );
}
