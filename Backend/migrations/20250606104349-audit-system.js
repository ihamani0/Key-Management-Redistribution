'use strict';

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up (queryInterface, Sequelize) {
    

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION log_audit_event()
      RETURNS TRIGGER AS $$
      DECLARE
        user_id INTEGER;
        record_id_val INTEGER;
      BEGIN
        -- Get current user ID from session
        BEGIN
          user_id := current_setting('app.current_user_id')::INTEGER;
        EXCEPTION WHEN OTHERS THEN
          user_id := NULL;
        END;

        -- Determine record_id based on table name
        CASE TG_TABLE_NAME
        WHEN 'users' THEN 
            record_id_val := COALESCE(NEW.id, OLD.id);
        WHEN 'subsets' THEN 
            record_id_val := COALESCE(NEW.id, OLD.id);
        WHEN 'gateways' THEN 
            record_id_val := COALESCE(NEW.id, OLD.id);
        WHEN 'devices' THEN 
            record_id_val := COALESCE(NEW.device_id, OLD.device_id);
        WHEN 'device_keys' THEN 
            record_id_val := COALESCE(NEW.key_id, OLD.key_id);
        WHEN 'key_redistribution_tasks' THEN 
            record_id_val := COALESCE(NEW.task_id, OLD.task_id);
        ELSE 
            record_id_val := COALESCE(NEW.id, OLD.id); -- Fallback
        END CASE;

        IF (TG_OP = 'DELETE') THEN
          INSERT INTO audit_logs (table_name, record_id, operation, old_data, changed_by)
          VALUES (TG_TABLE_NAME, record_id_val, 'DELETE', to_jsonb(OLD), user_id);
          RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
          VALUES (TG_TABLE_NAME, record_id_val, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), user_id);
          RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO audit_logs (table_name, record_id, operation, new_data, changed_by)
          VALUES (TG_TABLE_NAME, record_id_val, 'INSERT', to_jsonb(NEW), user_id);
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);


    // Create triggers for each table
    const tables = ['users', 'subsets', 'gateways', 'devices', 'key_redistribution_tasks', 'device_keys'];
    
    for (const table of tables) {

      await queryInterface.sequelize.query(`
        CREATE TRIGGER ${table}_audit_trigger
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION log_audit_event()
      `);

    }
    


  },

  async down (queryInterface, Sequelize) {
     
    const tables = ['users', 'subsets', 'gateways', 'devices', 'key_redistribution_tasks', 'DeviceKeys'];
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS ${table}_audit_trigger ON ${table}
      `);
    }

    // Then drop function and table
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS log_audit_event()');
   
  
  }


};
