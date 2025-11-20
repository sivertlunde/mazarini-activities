import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IParticipant {
  id: string;
  name: string;
  tickets: number;
}

type ParticipantStore = {
  participants: IParticipant[];
  addParticipant: (participant: IParticipant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (participant: IParticipant) => void;
  setParticipants: (list: IParticipant[]) => void;
};

const useParticipantStore = create<ParticipantStore>()(
  persist(
    (set) => ({
      participants: [],
      addParticipant: (participant: IParticipant) => {
        set((state) => ({
          participants: [...state.participants, participant],
        }));
      },
      removeParticipant: (id: string) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        }));
      },
      updateParticipant: (participant: IParticipant) => {
        set((state) => ({
          participants: state.participants
            .map((a) =>
              a.name === participant.name
                ? { ...a, tickets: a.tickets - 1 }
                : a,
            )
            .filter((a) => a.tickets > 0),
        }));
      },
      setParticipants: (list: IParticipant[]) => {
        set({ participants: list });
      },
    }),
    {
      name: 'participant-storage',
    },
  ),
);

export default useParticipantStore;
