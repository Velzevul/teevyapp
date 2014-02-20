class CreateSubscription < ActiveRecord::Migration
  def change
    create_table :subscriptions do |t|
      t.references :user,    index: true
      t.references :show,    index: true
      t.references :episode, index: true
    end
  end
end
