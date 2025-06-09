import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SearchBar = ({
  placeholder = "Search...",
  value = "",
  onChange = () => {},
  ariaLabel = "Search",
  className = "relative w-full sm:w-64"
}) => {
  return (
    <div className={className}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default SearchBar;