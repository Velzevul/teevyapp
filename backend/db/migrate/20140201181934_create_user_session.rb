class CreateUserSession < ActiveRecord::Migration
  def change
    create_table :user_sessions do |t|
      t.string :username
      t.string :password
    end
  end
end
