import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Plus, 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Copy,
  Check,
  BarChart3,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Mail,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LogisticsService, LogisticsItem } from '../../services/logisticsService';

const addLogisticsSchema = z.object({
  logisticsName: z.string().min(3, 'Logistics name must be at least 3 characters').max(100, 'Logistics name must not exceed 100 characters'),
  totalQuantity: z.number().min(1, 'Total quantity must be at least 1').max(10000, 'Total quantity must not exceed 10,000'),
});

type AddLogisticsFormData = z.infer<typeof addLogisticsSchema>;

interface LogisticsManagementProps {
  hackathonId: string;
  hackathonName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LogisticsManagement({ hackathonId, hackathonName, isOpen, onClose }: LogisticsManagementProps) {
  const [logistics, setLogistics] = useState<LogisticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedSecrets, setCopiedSecrets] = useState<Record<string, boolean>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({});
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddLogisticsFormData>({
    resolver: zodResolver(addLogisticsSchema),
  });

  // Load logistics data when modal opens
  useEffect(() => {
    if (isOpen && hackathonId) {
      fetchLogistics();
    }
  }, [isOpen, hackathonId]);

  const fetchLogistics = async () => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to view logistics');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await LogisticsService.fetchLogistics({
        email: currentUser.email,
        authToken: currentUser.authToken,
        hackathonId: hackathonId,
      });

      setLogistics(response.logistics);
    } catch (error: any) {
      if (error.message === 'No logistics found for this hackathon.') {
        setLogistics([]);
      } else {
        showError('Failed to Load Logistics', error.message || 'Unable to fetch logistics data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLogistics = async (data: AddLogisticsFormData) => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to add logistics');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await LogisticsService.addLogistics({
        email: currentUser.email,
        authToken: currentUser.authToken,
        hackathonId: hackathonId,
        logisticsName: data.logisticsName,
        totalQuantity: data.totalQuantity,
      });

      showSuccess(
        'Logistics Added Successfully! 📦',
        `${data.logisticsName} has been added with secret code: ${response.secretCode}`
      );

      reset();
      setShowAddForm(false);
      
      // Refresh logistics list
      await fetchLogistics();

    } catch (error: any) {
      showError(
        'Failed to Add Logistics',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecretCode = async (logisticsId: string, secretCode: string) => {
    try {
      await navigator.clipboard.writeText(secretCode);
      setCopiedSecrets(prev => ({ ...prev, [logisticsId]: true }));
      showSuccess('Copied!', 'Secret code copied to clipboard');
      setTimeout(() => {
        setCopiedSecrets(prev => ({ ...prev, [logisticsId]: false }));
      }, 2000);
    } catch (error) {
      showError('Copy Failed', 'Unable to copy secret code');
    }
  };

  const toggleSecretVisibility = (logisticsId: string) => {
    setVisibleSecrets(prev => ({ ...prev, [logisticsId]: !prev[logisticsId] }));
  };

  const toggleDropdown = (logisticsId: string) => {
    setExpandedDropdowns(prev => ({ ...prev, [logisticsId]: !prev[logisticsId] }));
  };

  const calculateTotalItems = () => {
    return logistics.reduce((total, item) => total + item.totalQuantity, 0);
  };

  const calculateTotalGivenAway = () => {
    return logistics.reduce((total, item) => total + item.givenAway, 0);
  };

  const calculateTotalRemaining = () => {
    return calculateTotalItems() - calculateTotalGivenAway();
  };

  const calculateTotalGivenAwayTo = () => {
    return logistics.reduce((total, item) => total + (item.participants?.length || 0), 0);
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
                      <Truck className="h-8 w-8 text-background" />
                    </motion.div>
                    <h1 className="font-space font-bold text-3xl text-background">
                      LOGISTICS MANAGEMENT
                    </h1>
                  </div>
                  
                  <p className="font-inter text-background/90 text-lg mb-4">
                    {hackathonName}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {logistics.length} LOGISTICS ITEMS
                      </span>
                    </div>
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {calculateTotalItems()} TOTAL ITEMS
                      </span>
                    </div>
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {calculateTotalRemaining()} REMAINING
                      </span>
                    </div>
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {calculateTotalGivenAwayTo()} RECIPIENTS
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
              {/* Summary Stats */}
              <div className="grid grid-cols-1 tablet:grid-cols-4 gap-4 mb-8">
                {[
                  { 
                    label: 'TOTAL ITEMS', 
                    value: calculateTotalItems(), 
                    icon: Package,
                    color: 'bg-accent/20 border-accent'
                  },
                  { 
                    label: 'GIVEN AWAY', 
                    value: calculateTotalGivenAway(), 
                    icon: CheckCircle,
                    color: 'bg-secondary/20 border-secondary'
                  },
                  { 
                    label: 'REMAINING', 
                    value: calculateTotalRemaining(), 
                    icon: BarChart3,
                    color: 'bg-primary/10 border-primary'
                  },
                  { 
                    label: 'GIVEN AWAY TO', 
                    value: calculateTotalGivenAwayTo(), 
                    icon: Users,
                    color: 'bg-accent/30 border-accent'
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`${stat.color} border-4 shadow-brutal p-6 text-center relative overflow-hidden group`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-4 relative z-10" />
                    <div className="font-space font-bold text-3xl text-primary mb-2 relative z-10">
                      {stat.value}
                    </div>
                    <div className="font-inter font-semibold text-primary text-sm relative z-10">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Logistics Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-space font-bold text-2xl text-primary">
                  LOGISTICS ITEMS
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-accent text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  ADD LOGISTICS
                </motion.button>
              </div>

              {/* Add Logistics Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-accent/10 border-2 border-primary shadow-brutal p-6 mb-6"
                  >
                    <h3 className="font-space font-bold text-xl text-primary mb-4">
                      ADD NEW LOGISTICS ITEM
                    </h3>
                    
                    <form onSubmit={handleSubmit(handleAddLogistics)} className="space-y-4">
                      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="logisticsName" className="block font-inter font-semibold text-primary mb-2">
                            LOGISTICS NAME *
                          </label>
                          <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                            <input
                              {...register('logisticsName')}
                              type="text"
                              id="logisticsName"
                              className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                errors.logisticsName 
                                  ? 'border-secondary focus:border-secondary' 
                                  : 'border-primary focus:border-secondary'
                              }`}
                              placeholder="e.g., T-Shirts, Stickers, Swag Bags"
                              disabled={isSubmitting}
                            />
                            {errors.logisticsName && (
                              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                            )}
                          </div>
                          {errors.logisticsName && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <span>{errors.logisticsName.message}</span>
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="totalQuantity" className="block font-inter font-semibold text-primary mb-2">
                            TOTAL QUANTITY *
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                            <input
                              {...register('totalQuantity', { valueAsNumber: true })}
                              type="number"
                              id="totalQuantity"
                              min="1"
                              max="10000"
                              className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                errors.totalQuantity 
                                  ? 'border-secondary focus:border-secondary' 
                                  : 'border-primary focus:border-secondary'
                              }`}
                              placeholder="e.g., 100"
                              disabled={isSubmitting}
                            />
                            {errors.totalQuantity && (
                              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                            )}
                          </div>
                          {errors.totalQuantity && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <span>{errors.totalQuantity.message}</span>
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-secondary text-background py-3 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              ADDING...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Plus className="mr-2 h-5 w-5" />
                              ADD LOGISTICS
                            </div>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          disabled={isSubmitting}
                          className="bg-background text-primary py-3 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold disabled:opacity-50"
                        >
                          CANCEL
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logistics List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-secondary mx-auto mb-4 animate-spin" />
                  <h3 className="font-space font-bold text-xl text-primary mb-2">
                    LOADING LOGISTICS
                  </h3>
                  <p className="font-inter text-primary/70">
                    Fetching logistics data...
                  </p>
                </div>
              ) : logistics.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-accent/10 border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
                    <Package className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                    <h3 className="font-space font-bold text-xl text-primary mb-2">
                      NO LOGISTICS YET
                    </h3>
                    <p className="font-inter text-primary/70 mb-6">
                      Add your first logistics item to get started
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddForm(true)}
                      className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold inline-flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      ADD LOGISTICS
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
                  {logistics.map((item, index) => {
                    const remaining = LogisticsService.calculateRemaining(item.totalQuantity, item.givenAway);
                    const percentage = (item.givenAway / item.totalQuantity) * 100;
                    const participantEmails = item.participants || [];
                    const isDropdownExpanded = expandedDropdowns[item.logisticsId];
                    
                    return (
                      <motion.div
                        key={item.logisticsId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: '12px 12px 0px #000000' }}
                        className="bg-background border-4 border-primary shadow-brutal p-6 relative group"
                      >
                        {/* Item Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-space font-bold text-lg text-primary mb-1">
                              {item.logisticsName}
                            </h4>
                            <p className="font-inter text-primary/70 text-sm">
                              ID: {item.logisticsId}
                            </p>
                          </div>
                          <div className="bg-accent/20 border-2 border-primary p-2">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                        </div>

                        {/* Quantity Stats */}
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-inter font-semibold text-primary text-sm">Total:</span>
                            <span className="font-space font-bold text-primary">{item.totalQuantity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-inter font-semibold text-primary text-sm">Given Away:</span>
                            <span className="font-space font-bold text-secondary">{item.givenAway}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-inter font-semibold text-primary text-sm">Remaining:</span>
                            <span className="font-space font-bold text-accent">{remaining}</span>
                          </div>
                          
                          {/* Given Away To Dropdown */}
                          <div className="border-t border-primary/20 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-inter font-semibold text-primary text-sm">Given Away To:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-space font-bold text-accent">{participantEmails.length}</span>
                                {participantEmails.length > 0 && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleDropdown(item.logisticsId)}
                                    className="bg-accent/20 text-primary p-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                    title={isDropdownExpanded ? "Hide Recipients" : "Show Recipients"}
                                  >
                                    {isDropdownExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </motion.button>
                                )}
                              </div>
                            </div>
                            
                            {/* Dropdown Content */}
                            <AnimatePresence>
                              {isDropdownExpanded && participantEmails.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 bg-accent/10 border-2 border-primary p-3 max-h-32 overflow-y-auto"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-inter font-semibold text-primary text-xs">RECIPIENTS LIST</span>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => toggleDropdown(item.logisticsId)}
                                      className="text-primary/70 hover:text-primary transition-colors duration-200"
                                      title="Close"
                                    >
                                      <X className="h-3 w-3" />
                                    </motion.button>
                                  </div>
                                  <div className="space-y-1">
                                    {participantEmails.map((email, emailIndex) => (
                                      <motion.div
                                        key={emailIndex}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: emailIndex * 0.05 }}
                                        className="flex items-center space-x-2 p-2 bg-background border border-primary/30 hover:bg-accent/5 transition-colors duration-200"
                                      >
                                        <Mail className="h-3 w-3 text-primary/50 flex-shrink-0" />
                                        <span className="font-inter text-primary text-xs truncate">
                                          {typeof email === 'string' ? email : email.email || 'Unknown'}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            {/* No Recipients Message */}
                            {participantEmails.length === 0 && (
                              <div className="mt-2 text-center">
                                <span className="font-inter text-primary/50 text-xs">No recipients yet</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-inter text-primary/70 text-xs">Progress</span>
                            <span className="font-inter text-primary/70 text-xs">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-primary/20 h-3 border-2 border-primary">
                            <motion.div
                              className="h-full bg-secondary"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Secret Code */}
                        <div className="border-t-2 border-primary pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-inter font-semibold text-primary text-sm">Secret Code:</span>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleSecretVisibility(item.logisticsId)}
                                className="bg-background text-primary p-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                title={visibleSecrets[item.logisticsId] ? "Hide Secret" : "Show Secret"}
                              >
                                {visibleSecrets[item.logisticsId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => copySecretCode(item.logisticsId, item.secretCode)}
                                className="bg-accent text-primary p-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                title="Copy Secret Code"
                              >
                                {copiedSecrets[item.logisticsId] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </motion.button>
                            </div>
                          </div>
                          <div className="bg-primary/10 border border-primary p-2 font-mono text-sm text-center">
                            {visibleSecrets[item.logisticsId] ? item.secretCode : '••••••••••••••••'}
                          </div>
                        </div>

                        {/* Created Date */}
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-primary/50" />
                            <span className="font-inter text-primary/70 text-xs">
                              Created: {LogisticsService.formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
                      </motion.div>
                    );
                  })}
                </div>
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
                    Manage logistics items and track distribution
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