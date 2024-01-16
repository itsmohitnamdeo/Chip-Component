import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import './ChipComponent.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Chip {
  id: number;
  label: string;
  email: string;
  highlighted?: boolean;
}

const ChipComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [isItemListVisible, setItemListVisible] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setItemListVisible(true);
  };

  const handleItemClick = (user: User) => {
    setChips((prevChips) => [
      ...prevChips,
      { id: user.id, label: user.name, email: user.email },
    ]);
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    setInputValue('');
    setItemListVisible(false);
  };

  const handleChipRemove = (chipId: number) => {
    const removedChip = chips.find((chip) => chip.id === chipId);
    if (removedChip) {
      setChips((prevChips) => prevChips.filter((chip) => chip.id !== chipId));
      const removedUser = users.find((user) => user.id === removedChip.id);
      setUsers((prevUsers) => [...prevUsers, { id: removedChip.id, name: removedChip.label, email: removedChip.email }]);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '') {
      if (chips.length > 0) {
        const lastChip = chips[chips.length - 1];
        if (lastChip.highlighted) {
          handleChipRemove(lastChip.id);
          setItemListVisible(false);
          setInputValue('');
          e.preventDefault();
          e.stopPropagation();
        } else {
          handleChipClick(lastChip.id);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  };

  const highlightMatchedCharacters = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'ig');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  const handleChipClick = (chipId: number) => {
    setChips((prevChips) =>
      prevChips.map((chip) => ({
        ...chip,
        highlighted: chip.id === chipId,
      }))
    );
  };

  return (
    <div className="chip-container">
      <h2>Pick Users</h2>
      <div className="chips">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className={`chip ${chip.highlighted ? 'highlighted' : ''}`}
            onClick={() => handleChipClick(chip.id)}
          >
            <img
              src={`https://i.pravatar.cc/30?u=${chip.id}`}
              alt={`Avatar for ${chip.label}`}
              className="chip-avatar"
            />
            {chip.label}
            <span className="remove-icon" onClick={() => handleChipRemove(chip.id)}>
              X
            </span>
          </div>
        ))}
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={chips.length > 0 ? '' : 'Add new user...'}
          />
        </div>
        <div className="line"></div>
      </div>
      {isItemListVisible && (
        <ul className="item-list">
          {users
            .filter((user) =>
              user.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((user) => (
              <li key={user.id} onClick={() => handleItemClick(user)}>
                <img
                  src={`https://i.pravatar.cc/30?u=${user.id}`}
                  alt={`Avatar for ${user.name}`}
                  className="item-avatar"
                />
                <span className="name">
                  {highlightMatchedCharacters(user.name, inputValue)}
                </span>
                <span className="email">{user.email}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default ChipComponent;
