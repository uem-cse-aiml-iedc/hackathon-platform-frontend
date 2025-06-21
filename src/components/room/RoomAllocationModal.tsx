import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Plus, 
  Building, 
  Users, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Hash,
  MapPin,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Monitor,
  Armchair
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { RoomAllocationService, RoomData, AllocationResult } from '../../services/roomAllocationService';

const roomSchema = z.object({
  roomNo: z.string().min(1, 'Room number is required'),
  seatsPerRow: z.number().min(1, 'Seats per row must be at least 1').max(20, 'Maximum 20 seats per row'),
  numRows: z.number().min(1, 'Number of rows must be at least 1').max(20, 'Maximum 20 rows'),
});

const allocationSchema = z.object({
  rooms: z.array(roomSchema).min(1, 'At least one room is required'),
});

type AllocationFormData = z.infer<typeof allocationSchema>;

interface RoomAllocationModalProps {
  hackathonId: string;
  hackathonName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomAllocationModal({ hackathonId, hackathonName, isOpen, onClose }: RoomAllocationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      rooms: [
        { roomNo: 'Room1', seatsPerRow: 4, numRows: 3 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  });

  const watchedRooms = watch('rooms');

  const addRoom = () => {
    append({ 
      roomNo: `Room${fields.length + 1}`, 
      seatsPerRow: 4, 
      numRows: 3 
    });
  };

  const removeRoom = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      showError('Cannot Remove Room', 'At least one room must be present');
    }
  };

  const onSubmit = async (data: AllocationFormData) => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to allocate rooms');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await RoomAllocationService.allocateTeams({
        hackathonId,
        roomData: data.rooms,
      });

      setAllocationResult(response);
      setShowVisualization(true);

      showSuccess(
        'Room Allocation Complete! 🏢',
        `Successfully allocated ${response.allocation.length} teams across ${data.rooms.length} rooms`
      );

    } catch (error: any) {
      showError(
        'Allocation Failed',
        error.message || 'Failed to allocate teams to rooms'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAllocationResult(null);
    setShowVisualization(false);
    reset({
      rooms: [
        { roomNo: 'Room1', seatsPerRow: 4, numRows: 3 }
      ],
    });
  };

  const calculateTotalSeats = () => {
    return watchedRooms.reduce((total, room) => {
      return total + (room.seatsPerRow * room.numRows);
    }, 0);
  };

  const getTeamColor = (teamIndex: number) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400',
      'bg-teal-400', 'bg-cyan-400', 'bg-lime-400', 'bg-emerald-400',
      'bg-violet-400', 'bg-fuchsia-400', 'bg-rose-400', 'bg-amber-400'
    ];
    return colors[teamIndex % colors.length];
  };

  const renderSeatingVisualization = () => {
    if (!allocationResult || !showVisualization) return null;

    // Group allocations by room
    const roomAllocations = allocationResult.allocation.reduce((acc, allocation) => {
      if (!allocation.roomNo) return acc;
      
      if (!acc[allocation.roomNo]) {
        acc[allocation.roomNo] = [];
      }
      acc[allocation.roomNo].push(allocation);
      return acc;
    }, {} as Record<string, typeof allocationResult.allocation>);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-gradient-to-br from-accent/10 to-secondary/10 border-4 border-primary shadow-brutal p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-space font-bold text-2xl text-primary flex items-center">
            <Monitor className="h-6 w-6 mr-2" />
            VENUE SEATING VISUALIZATION
          </h3>
          <div className="bg-background border-2 border-primary px-4 py-2">
            <span className="font-inter font-bold text-primary text-sm">
              🎯 {allocationResult.allocation.filter(a => a.roomNo).length} Teams Allocated
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-8">
          {watchedRooms.map((room, roomIndex) => {
            const roomTeams = roomAllocations[room.roomNo] || [];
            
            return (
              <motion.div
                key={room.roomNo}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: roomIndex * 0.1 }}
                className="bg-background border-4 border-primary shadow-brutal p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-space font-bold text-xl text-primary">
                    {room.roomNo}
                  </h4>
                  <div className="flex space-x-2">
                    <div className="bg-accent/20 border-2 border-primary px-3 py-1">
                      <span className="font-inter font-bold text-primary text-sm">
                        {room.seatsPerRow}×{room.numRows}
                      </span>
                    </div>
                    <div className="bg-secondary/20 border-2 border-primary px-3 py-1">
                      <span className="font-inter font-bold text-primary text-sm">
                        {roomTeams.length} Teams
                      </span>
                    </div>
                  </div>
                </div>

                {/* Room Layout */}
                <div className="space-y-2 mb-4">
                  {Array.from({ length: room.numRows }, (_, rowIndex) => {
                    const rowTeams = roomTeams.filter(team => team.row === rowIndex + 1);
                    
                    return (
                      <div key={rowIndex} className="flex items-center space-x-2">
                        <div className="w-12 text-center">
                          <span className="font-inter font-bold text-primary text-sm">
                            R{rowIndex + 1}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {Array.from({ length: room.seatsPerRow }, (_, seatIndex) => {
                            // Find if there's a team occupying this seat
                            let occupyingTeam = null;
                            let seatsTaken = 0;
                            
                            for (const team of rowTeams) {
                              if (seatsTaken <= seatIndex && seatsTaken + team.teamSize > seatIndex) {
                                occupyingTeam = team;
                                break;
                              }
                              seatsTaken += team.teamSize;
                            }

                            const teamIndex = occupyingTeam ? 
                              allocationResult.allocation.findIndex(a => a === occupyingTeam) : -1;

                            return (
                              <motion.div
                                key={seatIndex}
                                whileHover={{ scale: 1.1 }}
                                className={`w-8 h-8 border-2 border-primary flex items-center justify-center relative group ${
                                  occupyingTeam 
                                    ? `${getTeamColor(teamIndex)} text-white` 
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                                title={occupyingTeam ? 
                                  `Team ${teamIndex + 1} (${occupyingTeam.teamSize} members)` : 
                                  'Empty seat'
                                }
                              >
                                <Armchair className="h-4 w-4" />
                                
                                {/* Tooltip */}
                                {occupyingTeam && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-background text-xs font-inter font-bold border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                                    Team {teamIndex + 1} ({occupyingTeam.teamSize} members)
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Room Statistics */}
                <div className="border-t-2 border-primary pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-space font-bold text-lg text-primary">
                        {room.seatsPerRow * room.numRows}
                      </div>
                      <div className="font-inter text-primary/70 text-sm">Total Seats</div>
                    </div>
                    <div className="text-center">
                      <div className="font-space font-bold text-lg text-secondary">
                        {roomTeams.reduce((sum, team) => sum + team.teamSize, 0)}
                      </div>
                      <div className="font-inter text-primary/70 text-sm">Occupied</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Team Legend */}
        <div className="mt-8 bg-background border-4 border-primary shadow-brutal p-6">
          <h4 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            TEAM ALLOCATION LEGEND
          </h4>
          
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
            {allocationResult.allocation
              .filter(allocation => allocation.roomNo)
              .map((allocation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-3 border-2 border-primary bg-accent/5"
                >
                  <div className={`w-6 h-6 border-2 border-primary ${getTeamColor(index)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-inter font-bold text-primary text-sm">
                      Team {index + 1}
                    </div>
                    <div className="font-inter text-primary/70 text-xs">
                      {allocation.teamSize} members • {allocation.roomNo} Row {allocation.row}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-space font-bold text-accent text-sm">
                      {allocation.remainingSeats}
                    </div>
                    <div className="font-inter text-primary/70 text-xs">remaining</div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Unallocated Teams */}
          {allocationResult.allocation.some(a => !a.roomNo) && (
            <div className="mt-6 p-4 bg-secondary/10 border-2 border-secondary">
              <h5 className="font-inter font-bold text-secondary mb-2">⚠️ UNALLOCATED TEAMS:</h5>
              <div className="space-y-2">
                {allocationResult.allocation
                  .filter(allocation => !allocation.roomNo)
                  .map((allocation, index) => (
                    <div key={index} className="font-inter text-primary text-sm">
                      • Team with {allocation.teamSize} members - {allocation.message}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.print()}
            className="bg-accent text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold"
          >
            PRINT LAYOUT
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetForm}
            className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold"
          >
            NEW ALLOCATION
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background border-4 border-primary shadow-brutal max-w-6xl w-full max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary via-accent to-secondary p-6 border-b-4 border-primary relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Building className="h-8 w-8 text-background" />
                    </motion.div>
                    <h1 className="font-space font-bold text-3xl text-background">
                      ROOM ALLOCATION HELP
                    </h1>
                  </div>
                  
                  <p className="font-inter text-background/90 text-lg mb-4">
                    {hackathonName}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {fields.length} ROOMS CONFIGURED
                      </span>
                    </div>
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {calculateTotalSeats()} TOTAL SEATS
                      </span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="bg-background/20 text-background p-3 border-2 border-background/30 shadow-brutal-sm hover:bg-background/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              {!showVisualization ? (
                /* Room Configuration Form */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Algorithm Explanation */}
                  <div className="bg-accent/10 border-4 border-primary shadow-brutal p-6 mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-8 w-8 text-secondary" />
                      </motion.div>
                      <h2 className="font-space font-bold text-2xl text-primary">
                        SMART ALLOCATION ALGORITHM
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Target className="h-12 w-12 text-accent mx-auto mb-3" />
                        <h3 className="font-space font-bold text-lg text-primary mb-2">BEST FIT</h3>
                        <p className="font-inter text-primary/70 text-sm">
                          Minimizes wasted seats by finding optimal team-to-row matches
                        </p>
                      </div>
                      <div className="text-center">
                        <Zap className="h-12 w-12 text-secondary mx-auto mb-3" />
                        <h3 className="font-space font-bold text-lg text-primary mb-2">FAST ALLOCATION</h3>
                        <p className="font-inter text-primary/70 text-sm">
                          Reduces waiting time and eliminates external fragmentation
                        </p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-accent mx-auto mb-3" />
                        <h3 className="font-space font-bold text-lg text-primary mb-2">VISUAL TRACKING</h3>
                        <p className="font-inter text-primary/70 text-sm">
                          Cinema-hall style visualization for easy venue management
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Room Configuration */}
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-space font-bold text-2xl text-primary">
                          CONFIGURE ROOMS
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={addRoom}
                          className="bg-accent text-primary px-4 py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          ADD ROOM
                        </motion.button>
                      </div>

                      <div className="space-y-6">
                        {fields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-accent/10 border-4 border-primary shadow-brutal p-6 relative"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-space font-bold text-xl text-primary">
                                ROOM #{index + 1}
                              </h4>
                              {fields.length > 1 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeRoom(index)}
                                  className="bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                  title="Remove Room"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                              {/* Room Number */}
                              <div>
                                <label className="block font-inter font-semibold text-primary mb-2">
                                  ROOM NUMBER *
                                </label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                                  <input
                                    {...register(`rooms.${index}.roomNo`)}
                                    type="text"
                                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                      errors.rooms?.[index]?.roomNo 
                                        ? 'border-secondary focus:border-secondary' 
                                        : 'border-primary focus:border-secondary'
                                    }`}
                                    placeholder="e.g., Lab-A, Room-101"
                                  />
                                  {errors.rooms?.[index]?.roomNo && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                                  )}
                                </div>
                                {errors.rooms?.[index]?.roomNo && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.rooms[index]?.roomNo?.message}</span>
                                  </motion.p>
                                )}
                              </div>

                              {/* Seats Per Row */}
                              <div>
                                <label className="block font-inter font-semibold text-primary mb-2">
                                  SEATS PER ROW *
                                </label>
                                <div className="relative">
                                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                                  <input
                                    {...register(`rooms.${index}.seatsPerRow`, { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    max="20"
                                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                      errors.rooms?.[index]?.seatsPerRow 
                                        ? 'border-secondary focus:border-secondary' 
                                        : 'border-primary focus:border-secondary'
                                    }`}
                                    placeholder="e.g., 4"
                                  />
                                  {errors.rooms?.[index]?.seatsPerRow && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                                  )}
                                </div>
                                {errors.rooms?.[index]?.seatsPerRow && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.rooms[index]?.seatsPerRow?.message}</span>
                                  </motion.p>
                                )}
                              </div>

                              {/* Number of Rows */}
                              <div>
                                <label className="block font-inter font-semibold text-primary mb-2">
                                  NUMBER OF ROWS *
                                </label>
                                <div className="relative">
                                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                                  <input
                                    {...register(`rooms.${index}.numRows`, { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    max="20"
                                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                      errors.rooms?.[index]?.numRows 
                                        ? 'border-secondary focus:border-secondary' 
                                        : 'border-primary focus:border-secondary'
                                    }`}
                                    placeholder="e.g., 3"
                                  />
                                  {errors.rooms?.[index]?.numRows && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                                  )}
                                </div>
                                {errors.rooms?.[index]?.numRows && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.rooms[index]?.numRows?.message}</span>
                                  </motion.p>
                                )}
                              </div>
                            </div>

                            {/* Room Preview */}
                            <div className="mt-4 p-4 bg-background border-2 border-primary">
                              <div className="flex justify-between items-center">
                                <span className="font-inter font-semibold text-primary text-sm">
                                  Room Capacity:
                                </span>
                                <span className="font-space font-bold text-lg text-secondary">
                                  {(watchedRooms[index]?.seatsPerRow || 0) * (watchedRooms[index]?.numRows || 0)} seats
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-secondary/10 border-4 border-primary shadow-brutal p-6">
                      <h3 className="font-space font-bold text-xl text-primary mb-4">
                        ALLOCATION SUMMARY
                      </h3>
                      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="font-space font-bold text-2xl text-primary">
                            {fields.length}
                          </div>
                          <div className="font-inter text-primary/70">Total Rooms</div>
                        </div>
                        <div className="text-center">
                          <div className="font-space font-bold text-2xl text-secondary">
                            {calculateTotalSeats()}
                          </div>
                          <div className="font-inter text-primary/70">Total Seats</div>
                        </div>
                        <div className="text-center">
                          <div className="font-space font-bold text-2xl text-accent">
                            OPTIMAL
                          </div>
                          <div className="font-inter text-primary/70">Allocation Mode</div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-background py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      />
                      {isSubmitting ? (
                        <div className="flex items-center relative z-10">
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          ALLOCATING TEAMS...
                        </div>
                      ) : (
                        <div className="flex items-center relative z-10">
                          <Building className="mr-3 h-6 w-6" />
                          ALLOCATE TEAMS TO ROOMS
                        </div>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                /* Visualization Display */
                renderSeatingVisualization()
              )}
            </div>

            {/* Footer */}
            <div className="border-t-4 border-primary p-6 bg-primary/5">
              <div className="flex flex-col tablet:flex-row justify-between items-center space-y-4 tablet:space-y-0">
                <div className="text-center tablet:text-left">
                  <p className="font-inter text-primary/70 text-sm">
                    Hackathon ID: {hackathonId}
                  </p>
                  <p className="font-inter text-primary/60 text-xs">
                    Smart room allocation with minimal fragmentation
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                >
                  CLOSE
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}