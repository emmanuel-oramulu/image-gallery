import { ArrowLeftIcon,X } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"

interface SearchBarProps {
	search: string
	setSearch: React.Dispatch<React.SetStateAction<string>>
	inputRef: React.RefObject<HTMLInputElement|null>
}

export function SearchBar({ search,setSearch,inputRef }: SearchBarProps) {
	const navigate=useNavigate()

	return (
		<InputGroup className="h-14 max-w-sm rounded-full text-text-primary">
			<InputGroupAddon onClick={() => navigate(-1)}>
				<ArrowLeftIcon className="size-6 text-muted-foreground" />
			</InputGroupAddon>

			<InputGroupInput
				ref={inputRef}
				className="!h-14 text-lg placeholder:text-lg"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search..."
			/>

			{search&&<InputGroupAddon
				align="inline-end"
				onClick={() => setSearch("")}
			>
				<X className="size-6" />
			</InputGroupAddon>}
		</InputGroup>
	)
}