export interface RoomData {
  roomNo: string;
  seatsPerRow: number;
  numRows: number;
}

export interface AllocationRequest {
  hackathonId: string;
  roomData: RoomData[];
}

export interface TeamAllocation {
  teamSize: number;
  roomNo?: string;
  row?: number;
  remainingSeats?: number;
  message?: string;
}

export interface AllocationResult {
  message: string;
  allocation: TeamAllocation[];
}

export interface RoomAllocationError {
  message: string;
}

export class RoomAllocationService {
  private static readonly ALLOCATION_URL = 'https://server.aimliedc.tech/h4b-backend/allocation?option=allocate-teams';

  static async allocateTeams(data: AllocationRequest): Promise<AllocationResult> {
    try {
      console.log('Sending room allocation request:', data);
      
      const response = await fetch(this.ALLOCATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Room allocation response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to allocate teams to rooms');
      }

      return responseData;
    } catch (error) {
      console.error('Room allocation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static calculateTotalCapacity(rooms: RoomData[]): number {
    return rooms.reduce((total, room) => {
      return total + (room.seatsPerRow * room.numRows);
    }, 0);
  }

  static validateRoomConfiguration(rooms: RoomData[]): string[] {
    const errors: string[] = [];
    
    if (rooms.length === 0) {
      errors.push('At least one room is required');
    }

    const roomNumbers = new Set<string>();
    rooms.forEach((room, index) => {
      if (!room.roomNo.trim()) {
        errors.push(`Room ${index + 1}: Room number is required`);
      } else if (roomNumbers.has(room.roomNo)) {
        errors.push(`Room ${index + 1}: Duplicate room number "${room.roomNo}"`);
      } else {
        roomNumbers.add(room.roomNo);
      }

      if (room.seatsPerRow < 1 || room.seatsPerRow > 20) {
        errors.push(`Room ${index + 1}: Seats per row must be between 1 and 20`);
      }

      if (room.numRows < 1 || room.numRows > 20) {
        errors.push(`Room ${index + 1}: Number of rows must be between 1 and 20`);
      }
    });

    return errors;
  }

  static formatAllocationSummary(allocation: TeamAllocation[]): {
    totalTeams: number;
    allocatedTeams: number;
    unallocatedTeams: number;
    totalSeatsUsed: number;
    roomUtilization: Record<string, { used: number; total: number; percentage: number }>;
  } {
    const allocatedTeams = allocation.filter(a => a.roomNo);
    const unallocatedTeams = allocation.filter(a => !a.roomNo);
    
    const totalSeatsUsed = allocatedTeams.reduce((sum, team) => sum + team.teamSize, 0);
    
    const roomUtilization: Record<string, { used: number; total: number; percentage: number }> = {};
    
    // Calculate room utilization (this would need room capacity data)
    allocatedTeams.forEach(team => {
      if (team.roomNo) {
        if (!roomUtilization[team.roomNo]) {
          roomUtilization[team.roomNo] = { used: 0, total: 0, percentage: 0 };
        }
        roomUtilization[team.roomNo].used += team.teamSize;
      }
    });

    return {
      totalTeams: allocation.length,
      allocatedTeams: allocatedTeams.length,
      unallocatedTeams: unallocatedTeams.length,
      totalSeatsUsed,
      roomUtilization,
    };
  }
}