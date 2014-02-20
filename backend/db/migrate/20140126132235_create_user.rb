class CreateUser < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :login
      t.string :email
      t.string :avatar_url
      t.string :crypted_password
      t.string :password_salt
      t.string :persistence_token
    end
  end
end
