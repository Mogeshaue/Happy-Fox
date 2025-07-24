import React, { useState } from 'react';

// Form Component - Single Responsibility for form handling
const AdminForm = ({ fields, onSubmit, submitLabel, loading }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValid = fields.every(field => 
    !field.required || formData[field.name]
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {fields.map(field => (
        <div key={field.name}>
          {field.type === 'select' ? (
            <select
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '300px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          ) : (
            <input
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading || !isValid}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '6px',
          cursor: loading || !isValid ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          minWidth: '120px'
        }}
      >
        {loading ? 'Creating...' : submitLabel}
      </button>
    </form>
  );
};

// Table Component - Single Responsibility for data display
const DataTable = ({ columns, data, onDelete, loading }) => {
  if (!data || data.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px', fontStyle: 'italic' }}>
        No data found. Create some above.
      </p>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key} style={{
              backgroundColor: '#343a40',
              color: 'white',
              padding: '15px 10px',
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {column.label}
            </th>
          ))}
          <th style={{
            backgroundColor: '#343a40',
            color: 'white',
            padding: '15px 10px',
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.id || index} style={{
            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
          }}>
            {columns.map(column => (
              <td key={column.key} style={{
                padding: '12px 10px',
                borderBottom: '1px solid #e9ecef',
                verticalAlign: 'top'
              }}>
                {column.render ? column.render(item) : item[column.key]}
              </td>
            ))}
            <td style={{
              padding: '12px 10px',
              borderBottom: '1px solid #e9ecef',
              verticalAlign: 'top'
            }}>
              <button
                onClick={() => onDelete(item.id)}
                disabled={loading}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { AdminForm, DataTable };
