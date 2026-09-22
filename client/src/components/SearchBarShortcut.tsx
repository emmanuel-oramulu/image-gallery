import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchBarShortcut() {
	const navigate=useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate('/search')}
			className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-left text-muted-foreground"
		>
			<Search size={18} />
			<span>Search images...</span>
		</button>
	);
}