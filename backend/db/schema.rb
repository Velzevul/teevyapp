# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140201181934) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "episodes", force: true do |t|
    t.integer  "episode_index"
    t.string   "title"
    t.integer  "episode_number"
    t.integer  "season_number"
    t.datetime "aired_at"
    t.integer  "show_id"
  end

  add_index "episodes", ["show_id"], name: "index_episodes_on_show_id", using: :btree

  create_table "shows", force: true do |t|
    t.string "title"
    t.string "image_url"
    t.string "show_started"
    t.string "show_ended"
  end

  create_table "subscriptions", force: true do |t|
    t.integer "user_id"
    t.integer "show_id"
    t.integer "episode_id"
  end

  add_index "subscriptions", ["episode_id"], name: "index_subscriptions_on_episode_id", using: :btree
  add_index "subscriptions", ["show_id"], name: "index_subscriptions_on_show_id", using: :btree
  add_index "subscriptions", ["user_id"], name: "index_subscriptions_on_user_id", using: :btree

  create_table "user_sessions", force: true do |t|
    t.string "username"
    t.string "password"
  end

  create_table "users", force: true do |t|
    t.string "login"
    t.string "email"
    t.string "avatar_url"
    t.string "crypted_password"
    t.string "password_salt"
    t.string "persistence_token"
  end

end
