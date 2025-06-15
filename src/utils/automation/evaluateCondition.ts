
export const evaluateCondition = (condition: any, record: any): { met: boolean; log: string } => {
  const { field, operator, value: conditionValue, type } = condition;
  const fieldPath = field.split('.');

  let actualValue: any = record;
  for (const part of fieldPath.slice(1)) { // a/c for 'customer.name' or 'ticket.status'
    if (actualValue && typeof actualValue === 'object' && part in actualValue) {
      actualValue = actualValue[part];
    } else {
      return { met: false, log: `Field "${field}" not found on record.` };
    }
  }

  const logMessage = `Condition: [${field}] ("${actualValue}") ${operator} ("${conditionValue}")`;
  if (actualValue === null || actualValue === undefined) {
    return { met: false, log: `${logMessage} -> FAILED (field has no value)` };
  }

  let result = false;
  try {
    switch (type) {
      case 'text':
        const strValue = String(actualValue);
        switch (operator) {
          case 'equals': result = strValue.toLowerCase() === conditionValue.toLowerCase(); break;
          case 'not_equals': result = strValue.toLowerCase() !== conditionValue.toLowerCase(); break;
          case 'contains': result = strValue.toLowerCase().includes(conditionValue.toLowerCase()); break;
          case 'starts_with': result = strValue.toLowerCase().startsWith(conditionValue.toLowerCase()); break;
          case 'ends_with': result = strValue.toLowerCase().endsWith(conditionValue.toLowerCase()); break;
        }
        break;
      case 'number':
        const numValue = Number(actualValue);
        const numConditionValue = Number(conditionValue);
        if (isNaN(numValue) || isNaN(numConditionValue)) return { met: false, log: `${logMessage} -> FAILED (invalid number)` };
        switch (operator) {
          case 'equals': result = numValue === numConditionValue; break;
          case 'greater_than': result = numValue > numConditionValue; break;
          case 'less_than': result = numValue < numConditionValue; break;
          case 'greater_equal': result = numValue >= numConditionValue; break;
          case 'less_equal': result = numValue <= numConditionValue; break;
        }
        break;
      case 'date':
          const dateValue = new Date(actualValue);
          dateValue.setHours(0, 0, 0, 0);

          if (isNaN(dateValue.getTime())) return { met: false, log: `${logMessage} -> FAILED (invalid date in record)`};

          if (['days_ago', 'days_from_now'].includes(operator)) {
              const numDays = parseInt(conditionValue, 10);
              if (isNaN(numDays)) return { met: false, log: `${logMessage} -> FAILED (invalid number of days)` };
              
              const compareDate = new Date();
              compareDate.setHours(0,0,0,0);
              compareDate.setDate(compareDate.getDate() + (operator === 'days_ago' ? -numDays : numDays));
              result = dateValue.getTime() === compareDate.getTime();
          } else {
              const compareDate = new Date(conditionValue);
              compareDate.setHours(0,0,0,0);
              if (isNaN(compareDate.getTime())) return { met: false, log: `${logMessage} -> FAILED (invalid date value)` };

              switch (operator) {
                  case 'equals': result = dateValue.getTime() === compareDate.getTime(); break;
                  case 'before': result = dateValue.getTime() < compareDate.getTime(); break;
                  case 'after': result = dateValue.getTime() > compareDate.getTime(); break;
              }
          }
          break;
    }
  } catch (e: any) {
    return { met: false, log: `${logMessage} -> ERROR (${e.message})` };
  }
  return { met: result, log: `${logMessage} -> ${result ? 'PASSED' : 'FAILED'}` };
};
