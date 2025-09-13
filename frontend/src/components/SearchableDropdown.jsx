import React, { useState, useEffect, useRef } from 'react';
import '../CSS/SearchableDropdown.css';

const SearchableDropdown = ({ 
    options = [], 
    onSelect, 
    placeholder = "Search...", 
    displayKey = "name",
    valueKey = "id",
    fetchData,
    isLoading = false,
    value = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setSearchTerm(value || '');
    }, [value]);

    useEffect(() => {
        if (fetchData && searchTerm.length > 0) {
            fetchData(searchTerm);
        }
    }, [searchTerm, fetchData]);

    useEffect(() => {
        const filtered = options.filter(option =>
            String(option[displayKey] ?? '').toLowerCase().includes((searchTerm || '').toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [options, searchTerm, displayKey]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleOptionSelect = (option) => {
        setSearchTerm(option[displayKey] ?? '');
        setIsOpen(false);
        onSelect && onSelect(option);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsOpen(true);
        onSelect && onSelect(null);
    };

    return (
        <div className="searchable-dropdown" ref={dropdownRef}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => !disabled && setIsOpen(true)}
                placeholder={placeholder}
                className="dropdown-input"
                disabled={disabled}
            />
            {searchTerm && !disabled && (
                <button
                    type="button"
                    className="dropdown-clear"
                    onClick={handleClear}
                    aria-label="Clear selection"
                    title="Clear"
                >
                    ×
                </button>
            )}
            
            {isOpen && !disabled && (
                <div className="dropdown-menu">
                    {isLoading ? (
                        <div className="dropdown-item loading">Loading...</div>
                    ) : filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option[valueKey] ?? option[displayKey]}
                                className="dropdown-item"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option[displayKey]}
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-item no-results">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;