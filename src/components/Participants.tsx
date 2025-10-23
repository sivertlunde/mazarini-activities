import { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Section } from './styles';

import useParticipantStore, { IParticipant } from './stores/participantStore';
import { capitalizeAndCut } from './utils';

const ListItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ListItem = styled.li`
  width: 100%;
  padding: 10px;
  margin: 5px;
  background-color: #f9f9f9;
  border-radius: 5px;
  list-style: none;
  color: #282c34;
  font-weight: bold;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  & > button {
    margin-left: 10px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

export const Participants = () => {
  const participants = useParticipantStore((state) => state.participants);
  const addParticipant = useParticipantStore((state) => state.addParticipant);
  const removeParticipant = useParticipantStore(
    (state) => state.removeParticipant,
  );
  const [participant, setParticipant] = useState({
    id: crypto.randomUUID(),
    name: '',
    tickets: 1,
  });
  const [error, setError] = useState('');

  const validateInput = (participant: IParticipant) => {
    const specialCharPattern = /[^a-zA-Z0-9 ]/;
    if (!participant.name.trim()) {
      return 'Participant cannot be empty.';
    }
    if (specialCharPattern.test(participant.name)) {
      return 'Participant cannot contain special characters.';
    }
    if (participant.tickets < 1 || participant.tickets > 5) {
      return 'Participant must have between 1 and 5 tickets';
    }
    return '';
  };

  const handleAddParticipant = () => {
    const validationError = validateInput(participant);
    if (validationError) {
      setError(validationError);
    } else {
      addParticipant(participant);
      setParticipant({ id: crypto.randomUUID(), name: '', tickets: 1 });
      setError('');
    }
  };

  return (
    <Section>
      <h2>Add Participants</h2>
      <Input
        type="text"
        placeholder="Enter a name"
        value={participant.name}
        onChange={(e) =>
          setParticipant({ ...participant, name: e.target.value })
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            handleAddParticipant();
          }
        }}
      />
      <Input
        type="number"
        placeholder="How many tickets?"
        value={participant.tickets}
        onChange={(e) =>
          setParticipant({ ...participant, tickets: Number(e.target.value) })
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            handleAddParticipant();
          }
        }}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button onClick={handleAddParticipant}>Add</Button>
      <h2>Participants</h2>
      <ul>
        {participants.map(({ id, name, tickets }, index) => (
          <ListItemContainer key={index}>
            <ListItem>
              {capitalizeAndCut(name)}, {tickets}
            </ListItem>
            <Button onClick={() => removeParticipant(id)}>Del</Button>
          </ListItemContainer>
        ))}
      </ul>
    </Section>
  );
};
