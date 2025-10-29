import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/stores/patientStore';
const renderTemplate = (template: string, patient: Patient): string => {
  // Create a case-insensitive map of patient data keys
  const patientDataMap = new Map<string, any>();
  for (const key in patient) {
    patientDataMap.set(key.toLowerCase(), patient[key]);
  }
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const placeholder = key.trim().toLowerCase();
    const value = patientDataMap.get(placeholder);
    if (value === undefined || value === null) {
      return '';
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    // More robust date string check
    if (typeof value === 'string') {
      // Avoids converting pure numbers to dates. A date string usually has non-digit characters.
      const isDateString = !/^\d+$/.test(value) && !isNaN(Date.parse(value));
      if (isDateString) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
    }
    return String(value);
  });
};
export function PrintPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labelTemplate, setLabelTemplate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
const dataParam = urlParams.get('data');
const templateParam = urlParams.get('template');

const storedPatients = dataParam
  ? decodeURIComponent(dataParam)
  : sessionStorage.getItem('printablePatients');
const storedTemplate = templateParam
  ? decodeURIComponent(templateParam)
  : sessionStorage.getItem('labelTemplate');
      
      if (storedPatients && storedTemplate) {
        const parsedPatients = JSON.parse(storedPatients);
        if (Array.isArray(parsedPatients) && parsedPatients.length > 0) {
          setPatients(parsedPatients);
          setLabelTemplate(storedTemplate);
          sessionStorage.removeItem('printablePatients');
          sessionStorage.removeItem('labelTemplate');
        } else {
          throw new Error("No patient data found.");
        }
      } else {
        throw new Error("No patient data or template provided.");
      }
    } catch (e) {
      setError("Failed to load print data. Please try again.");
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate]);
  useEffect(() => {
    if (patients.length > 0 && labelTemplate) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [patients, labelTemplate]);
  if (error) {
    return <div className="p-4 font-sans text-center">{error} Redirecting...</div>;
  }
  if (patients.length === 0) {
    return <div className="p-4 font-sans text-center">Loading print preview...</div>;
  }
  return (
    <div className="label-container">
      {patients.map((patient) => (
        <div key={patient.id} className="label">
          <div className="label-content">
            {renderTemplate(labelTemplate, patient).split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}