import ServiceStatuses from "./ServiceStatuses";

export default function Sidebar() {
    return <div className="side-bar">
        {/* Top */}
        <div>
        </div>

        {/* Bottom */}
        <div>
            <ServiceStatuses />
            The Pomo App © 2025
        </div>
    </div>
}