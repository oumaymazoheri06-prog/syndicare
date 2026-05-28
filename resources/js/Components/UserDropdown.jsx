import Dropdown from "@/Components/Dropdown";

export default function UserDropdown({ user }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                    <button type="button">{user.name.split(" ")[0]}</button>
                </span>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <Dropdown.Link href={route("profile.edit")}>
                    Profil
                </Dropdown.Link>

                <Dropdown.Link href={route("logout")} method="post" as="button">
                    Deconnexion
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
}
