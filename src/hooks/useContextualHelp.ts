
import { useLocation } from 'react-router-dom';
import { helpContent } from '@/components/help/helpContent';

export const useContextualHelp = () => {
  const location = useLocation();
  
  const getCurrentPageHelp = () => {
    const currentPage = location.pathname.replace('/', '') || 'dashboard';
    return helpContent[currentPage] || helpContent.dashboard;
  };

  const getQuickTips = () => {
    const pageHelp = getCurrentPageHelp();
    return pageHelp.sections
      .filter(section => section.tips)
      .map(section => ({
        title: section.title,
        tip: section.tips
      }));
  };

  const getPageSteps = () => {
    const pageHelp = getCurrentPageHelp();
    return pageHelp.sections
      .filter(section => section.steps)
      .map(section => ({
        title: section.title,
        steps: section.steps
      }));
  };

  return {
    getCurrentPageHelp,
    getQuickTips,
    getPageSteps
  };
};
