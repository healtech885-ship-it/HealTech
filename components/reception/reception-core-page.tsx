import { ReceptionSidebar, ReceptionTopbar, getReceptionView } from "./reception-shell";
import { ReceptionDashboardView } from "./reception-dashboard";
import { ReceptionPatientsView } from "./reception-patients";
import { ReceptionAddPatientView } from "./reception-add-patient";
import { ReceptionPatientDetailsView } from "./reception-patient-details";

export function ReceptionCorePage({ segments }: { segments?: string[] }) {
  const view = getReceptionView(segments);
  const active =
    view === "dashboard" ? "Dashboard" :
      view === "patients" || view === "add-patient" || view === "patient-details" ? "Patients" :
        "Dashboard";

  return (
    <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
      <ReceptionSidebar active={active} />
      <section className="min-h-screen pl-[260px]">
        <ReceptionTopbar searchPlaceholder="Search patients, records...">
          {view === "dashboard" ? null : null}
        </ReceptionTopbar>
        {view === "dashboard" && <ReceptionDashboardView />}
        {view === "patients" && <ReceptionPatientsView />}
        {view === "add-patient" && <ReceptionAddPatientView />}
        {view === "patient-details" && <ReceptionPatientDetailsView />}
      </section>
    </main>
  );
}
